// SETTING FUNCTIONS
var TriggerRetry = function (AccNum, Amount, Phonenumber){
    var rosterAPI = require('ext/Roster_v1_2_0/api');
    rosterAPI.verbose = true;
    var IntPn = Phonenumber
    rosterAPI.dataTableAttach();
    var phone = {
        country: "KE",
        phone_number: "+"+PhoneNumber.formatInternationalRaw(Phonenumber, "KE")
    };
    var provider="Beyonic";
    var colResult = rosterAPI.collectPayment(AccNum,Amount , phone, provider);
    console.log(JSON.stringify(colResult));
    if (colResult.Success) {console.log("The user will get PIN authorization form on their phone to pay OAF")}
    else {console.log(colResult.Description + "Collection request failure happened")}
    return colResult.Success;
};

var RetrieveSessionCursor = function (AccNum, Amount, Phonenumber){
    var table = project.getOrCreateDataTable("Client portal 2.0");
    var IntPN = PhoneNumber.formatInternationalRaw(Phonenumber, "KE")
    NotUpdatedCursor = table.queryRows({
        'from_number' : IntPN,
        vars: {'AccNum':AccNum,
        'PaymentAmount':Amount,
        'UpdateReceived' : "NO"},
        'sort_dir' : "desc"
    });
    NotUpdatedCursor.limit(1);
    if (NotUpdatedCursor.hasNext()) {
        return NotUpdatedCursor.next();
    }
    else {
        RetryingCursor = table.queryRows({
            'from_number' : IntPN,
            vars: {'AccNum':AccNum,
            'PaymentAmount':Amount,
            'UpdateReceived' : "RETRYING"},
            'sort_dir' : "desc"
        });
        RetryingCursor.limit(1);
        if (RetryingCursor.hasNext()) {
            return RetryingCursor.next();
        }
        else{
            return false;
        }
    }
}

var RetrieveErrorMessage = function (ErrorMessage){
    var table = project.getOrCreateDataTable("BGS_ErrorMessages");
    ErrorCursor = table.queryRows({vars: {'errormessage':ErrorMessage}});
    ErrorCursor.limit(1);
    if (ErrorCursor.hasNext()) {
        var ErrorRow = NotUpdatedCursor.next();
        return ErrorRow;
    }
    else {
        DefaultCursor = table.queryRows({vars: {'errormessage':"default"}});
        DefaultCursor.limit(1);
        if (DefaultCursor.hasNext()) {
            var DefaultRow = DefaultCursor.next();
            return DefaultRow;
            // Row row row your boot
        }
        else{
            var row = table.createRow({
                vars: {
                    'errormessage': "default",
                    'sms_en': "An unexpected error occurred, please try again by dialing *689#",
                    'sms_sw': "Kuna hitilafu ya mitambo. Tafadhali jaribu tena kwa kubonyeza *689#",
                    'retry': false,
                    'sendsms': true,
                }
            });
            row.save();
            return row;
        }
    }
}

var SendErrorSMS = function (ErrorMesRow, PhoneNumber){
    var SMSPN = PhoneNumber.formatInternationalRaw(PhoneNumber, "KE");
    var English = contact.vars.English;
    var Label_BGS_Error = project.getOrCreateLabel("BGS_Error");
    var Label_LNG = project.getOrCreateLabel("Swahili");
    var SMSContent = row.vars.sms_sw
    if (English){
        Label_LNG = project.getOrCreateLabel("English");
        SMSContent = row.vars.sms_en
    }
    var sent_msg = project.sendMessage({
        content: SMSContent,
        to_number: SMSPN,
        label_ids: [Label_BGS_Error.id,Label_LNG.id],
    });
}

// START FLOW

console.log("Received collection request status update"+ contact.vars.collectionRequest);
var ColReq = JSON.parse(contact.vars.collectionRequest);
var IntPNCol = PhoneNumber.formatInternationalRaw(ColReq.phonenumber, "KE");
var IntPNContact = PhoneNumber.formatInternationalRaw(contact.phone_number, "KE");
if (IntPNCol== IntPNContact){
    var row = RetrieveSessionCursor(ColReq.metadata.accountNo, ColReq.amount, ColReq.phonenumber);
    if (row != 'false'){
        row.vars.PaymentStatus = ColReq.status;
        row.vars.ErrorMessage = ColReq.error_message;
        row.vars.BeyonicID = ColReq.id;
        if(ColReq.status == "failed"){
            var ErrorMes = RetrieveErrorMessage(ColReq.error_message);
            if (row.vars.UpdateReceived == "RETRYING"){
                row.vars.UpdateReceived = "DONE";
                row.vars.ColReqDoneTimeStamp = moment().format('X');
                if (ErrorMes.vars.sendsms == '1'){
                    SendErrorSMS(ErrorMes, ColReq.phonenumber);
                }
            }
            else{
                if (ErrorMes.vars.retry == '1'){
                    row.vars.UpdateReceived = "RETRYING";
                    row.vars.ColReqRetryTimeStamp = moment().format('X');
                    // TriggerRetry(ColReq.metadata.accountNo, ColReq.amount, ColReq.phonenumber);
                }
                else{
                    row.vars.UpdateReceived = "DONE";
                    row.vars.ColReqDoneTimeStamp = moment().format('X');
                    if (ErrorMes.vars.sendsms == '1'){
                        SendErrorSMS(ErrorMes, ColReq.phonenumber);
                    }
                }
            }
        }
        else{
            row.vars.UpdateReceived = "DONE";
            row.vars.ColReqDoneTimeStamp = moment().format('X');
        }
        row.save();
    }
}
else{
    sendEmail("tom.vranken@oneacrefund.org", 
    "BEYONIC NOTIFICATION ERROR", 
    "Phone numbers do not match between Beyonic payload and contact");
}
    

// var OldSimsTable = project.getOrCreateDataTable("BGS_OldSIMS");
// SimCursor = OldSimsTable.queryRows({vars: {'phonenumber':IntPNCol}});
// if (SimCursor.count() !== 0){
// Send out DS time out OLD SIMSMS
// OLD SIM SMS EN: Hello. Your SIM card is old and must be swapped by an Mpesa agent to make payments to One Acre Fund. If unsuccessful,use Paybill 840700
// OLD SIM SMS SW: Jambo. Kadi yako ya simu ni ya zamani. Ibadilishe kwa ajenti wa Mpesa ili uzidi kufanya malipo kwa One Acre Fund.Usipoweza, tumia Paybill 840700
// UPGRADE SMS EN: Hello.Your SIM card can't make a payment to One Acre Fund. Dial *234*1*6# to upgrade. If unsuccessful, use paybill 840700
// UPGRADE SMS SW: Jambo. Kadi yako ya simu ni ya kitambo haiwezi fanya malipo kwa One Acre Fund. Bonyeza *234*1*6# kuiboresha. Usipofaulu, tumia Paybill 840700