console.log("Received collection request status update"+ contact.vars.collectionRequest);
var ColReq = JSON.parse(contact.vars.collectionRequest);
var IntPNCol = PhoneNumber.formatInternationalRaw(ColReq.phonenumber, "KE");
var IntPNContact = PhoneNumber.formatInternationalRaw(contact.phone_number, "KE");
var English = contact.vars.English;
var Error1 = "[STK_CB - ]DS timeout.";
var Error2 = "Collection request failed.Please contact an administrator";
var Error3 = "[MpesaCB - ]The initiator information is invalid.";
var Error4 = "An unexpected response was received from an upstream provider. Please try again later or contact an administrator. Details: Code: 404, Description: Not Found";
var Error5 = "[STK_CB - ]SMSC ACK timeout.";
var Error6 = "[STK_CB - ]Transaction expired. No MO has been received";
var Error7 = "An unexpected response was received from an upstream provider. Please try again later or contact an administrator. Details: Expecting value: line 1 column 1 (char 0)";
var Error8 = "DS timeout.";
var Error9 = "Unable to lock subscriber, a transaction is already in process for the current subscriber";

var SMSPN = IntPNCol;


var Label_BizOps = project.getOrCreateLabel("Business Operations");
var Label_FailedPayment = project.getOrCreateLabel("Failed payment");
var Label_OldSim = project.getOrCreateLabel("OldSim");
var Label_Upgrade = project.getOrCreateLabel("UpgradeSim");
var Label_TechError = project.getOrCreateLabel("TechnicalError");
var Label_SW = project.getOrCreateLabel("Swahili");
var Label_EN = project.getOrCreateLabel("English");

if (IntPNCol== IntPNContact){
    var table = project.getOrCreateDataTable("Client portal 2.0");
    NotUpdatedCursor = table.queryRows({
        'from_number' : IntPNCol,
        vars: {'AccNum':ColReq.metadata.accountNo,
        'PaymentAmount':ColReq.amount,
        'UpdateReceived' : "NO"},
        'sort_dir' : "desc"
    });
    if (NotUpdatedCursor.hasNext()){

    while(NotUpdatedCursor.hasNext()){
        var row = NotUpdatedCursor.next();
        row.vars.PaymentStatus = ColReq.status;
        row.vars.ErrorMessage = ColReq.error_message;
        row.vars.BeyonicID = ColReq.id;
        if (ColReq.error_message == Error1 ||
            ColReq.error_message == Error2 ||
            ColReq.error_message == Error3 ||
            ColReq.error_message == Error4 ||
            ColReq.error_message == Error5 ||
            ColReq.error_message == Error6 ||
            ColReq.error_message == Error7 ||
            ColReq.error_message == Error8 ||
            ColReq.error_message == Error9){
                
            if (English){
                var sent_msg = project.sendMessage({
                    content: "An unexpected error occurred, please try again by dialing *689#\n",
                    to_number: SMSPN,
                    label_ids: [Label_BizOps.id,Label_FailedPayment.id,Label_TechError.id,Label_EN.id],
                });
            }
            else {
                var sent_msg = project.sendMessage({
                    content: "Kuna hitilafu ya mitambo. Tafadhali jaribu tena kwa kubonyeza *689#\n",
                    to_number: SMSPN,
                    label_ids: [Label_BizOps.id,Label_FailedPayment.id,Label_TechError.id,Label_EN.id],
                });
            }
                
                //console.log("Received collection request with error: "+ColReq.error_message+" A retry will be initiated");
                //var rosterAPI = require('ext/Roster_v1_2_0/api');
                //rosterAPI.verbose = true;
                //rosterAPI.dataTableAttach();
                //var phone = {
                //    country: "KE",
                //    phone_number: "+"+SMSPN
                //};
                //var provider="Beyonic";
                //var colResult = rosterAPI.collectPayment(ColReq.metadata.accountNo,ColReq.amount , phone, provider);
                //console.log(JSON.stringify(colResult));
                //if (colResult.Success) {console.log("The user will get PIN authorization form on their phone to pay OAF")}
                //else {console.log(colResult.Description + "Try again")}

            row.vars.UpdateReceived = "RETRYINGCANCELLED";
            row.vars.ColReqDoneTimeStamp = moment().format('X');
            //row.vars.ColReqRetryTimeStamp = moment().format('X');
        }
        else {
            row.vars.UpdateReceived = "DONE";
            row.vars.ColReqDoneTimeStamp = moment().format('X');
        }
        row.save();
    }
    }
    else{
    
    RetryingCursor = table.queryRows({
        'from_number' : IntPNCol,
        vars: {'AccNum':ColReq.metadata.accountNo,
        'PaymentAmount':ColReq.amount,
        'UpdateReceived' : "RETRYING"},
        'sort_dir' : "desc"
    });



    while(RetryingCursor.hasNext()){
        var row = RetryingCursor.next();
        row.vars.PaymentStatus = ColReq.status;
        row.vars.ErrorMessageAfterRetry = ColReq.error_message;
        row.vars.BeyonicID = ColReq.id;
        row.vars.UpdateReceived = "DONE";
        row.vars.ColReqDoneTimeStamp = moment().format('X');
        row.save();
        if (ColReq.error_message == Error1 || ColReq.error_message == Error8){
            var OldSimsTable = project.getOrCreateDataTable("BGS_OldSIMS");

            SimCursor = OldSimsTable.queryRows({
                vars: {'phonenumber':IntPNCol}});

            if (SimCursor.count() !== 0){
                // Send out DS time out OLD SIMSMS
                if (English){

                    var sent_msg = project.sendMessage({
                        content: "Hello. Your SIM card is old and must be swapped by an Mpesa agent to make payments to One Acre Fund. If unsuccessful,use Paybill 840700\n", 
                        to_number: SMSPN,
                        label_ids: [Label_BizOps.id,Label_FailedPayment.id,Label_OldSim.id,Label_EN.id],
                    });
                }
                else {
                    var sent_msg = project.sendMessage({
                        content: "Jambo. Kadi yako ya simu ni ya zamani. Ibadilishe kwa ajenti wa Mpesa ili uzidi kufanya malipo kwa One Acre Fund.Usipoweza, tumia Paybill 840700\n",
                        to_number: SMSPN,
                        label_ids: [Label_BizOps.id,Label_FailedPayment.id,Label_OldSim.id,Label_SW.id],
                    });
                }
            }
            else {
                // Send out DS time out UPGRADE SIM SMS
                if (English){
                    var sent_msg = project.sendMessage({
                        content: "Hello.Your SIM card can't make a payment to One Acre Fund. Dial *234*1*6# to upgrade. If unsuccessful, use paybill 840700.\n", 
                        to_number: SMSPN,
                        label_ids: [Label_BizOps.id,Label_FailedPayment.id,Label_Upgrade.id,Label_EN.id],
                    });
                }

                else {
                    var sent_msg = project.sendMessage({
                        content: "Jambo. Kadi yako ya simu ni ya kitambo haiwezi fanya malipo kwa One Acre Fund. Bonyeza *234*1*6# kuiboresha. Usipofaulu, tumia Paybill 840700\n", 
                        to_number: SMSPN,
                        label_ids: [Label_BizOps.id,Label_FailedPayment.id,Label_Upgrade.id,Label_SW.id],
                    });
                }
            }
        }
        else if (ColReq.error_message == Error2 ||
            ColReq.error_message == Error3 ||
            ColReq.error_message == Error4 ||
            ColReq.error_message == Error5 ||
            ColReq.error_message == Error6||
            ColReq.error_message ==  Error7 ||
            ColReq.error_message == Error8 ||
            ColReq.error_message == Error9){
            if (English){
                var sent_msg = project.sendMessage({
                    content: "An unexpected error occurred, please try again by dialing *689#\n",
                    to_number: SMSPN,
                    label_ids: [Label_BizOps.id,Label_FailedPayment.id,Label_TechError.id,Label_EN.id],
                });
            }
            else {
                var sent_msg = project.sendMessage({
                    content: "Kuna hitilafu ya mitambo. Tafadhali jaribu tena kwa kubonyeza *689#\n",
                    to_number: SMSPN,
                    label_ids: [Label_BizOps.id,Label_FailedPayment.id,Label_TechError.id,Label_EN.id],
                });
            }
        }
    }
    }
}
else {
    sendEmail("tom.vranken@oneacrefund.org", 
    "BEYONIC NOTIFICATION ERROR", 
    "Phone numbers do not match between Beyonic payload and contact");
}