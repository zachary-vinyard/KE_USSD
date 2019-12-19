// Setting global variables
var rosterAPI = require('ext/Roster_v1_2_0/api');
var MenuCount = 0;
var MenuNext = false;
var LocArray="";
var SiteName = "";
var RouteIDPush = "PNb0b7354798b84c85";
var RouteIDInteractive = "";
var ClientAccNum = "";
var FOLocatorSiteName = "";
var CurrentSeasonName = "2020, Long Rain";
var LastSeason = "2019, Long Rain";
var client = "";
var JITBundleOptions =[
    {'nameEN': '0.5 acre maize',
    'nameSW':'Mahindi Nusu Ekari',
    'price': 5580,
    'bundlename':'0.5 Maize',
    'relatedbundles':[{'bundlename': '0.25 Maize'}],
    'variety':true,
    'unitnumber':3,
    'JITE': true
    },
    {'nameEN': '0.25 acre maize',
    'nameSW':'Mahindi Robo Ekari',
    'price': 3170,
    'bundlename':'0.25 Maize',
    'relatedbundles':[{'bundlename': '0.5 Maize'}],
    'variety':true,
    'unitnumber':2,
    'JITE': true
    },
    {'nameEN': 'Harvest Drying Sheet',
    'nameSW':'Chandarua',
    'price': 3890,
    'bundlename':'Harvest Drying Sheet',
    'relatedbundles':[],
    'variety':false,
    'unitnumber':1,
    'JITE': false
    },
    {'nameEN': 'Sunking Boom',
    'nameSW':'Taa ya Sunking Boom',
    'price': 5090,
    'bundlename':'Sun King Boom',
    'relatedbundles':[],
    'variety':false,
    'unitnumber':1,
    'JITE': false
    },
    {'nameEN': 'Basic Mobile Phone Techno 349',
    'nameSW':'Simu ya Kubofia Techno 349',
    'price': 1950,
    'bundlename':'Basic Phone',
    'relatedbundles':[],
    'variety':false,
    'unitnumber':1,
    'JITE': false
    },
];
var JITTUMaxOrders = 3;
var FAWUnitPrice = 840;
var FAWMaxOrders = 2;
var StaffDistrict = "KENYA STAFF";
// Setting global functions
var InteractionCounter = function(input){
    try{
        if (typeof(state.vars.InteractionCount) == 'undefined') {state.vars.InteractionCount = 1}
        else{state.vars.InteractionCount = state.vars.InteractionCount +1}
        call.vars.InteractionCount = state.vars.InteractionCount;
        if (typeof(input) !== 'undefined') {
            var Now = moment().format('X');
            var varString = "call.vars.TimeStamp_"+input+"= Now";
            eval(varString);
        }
    }
    catch(err) {
        console.log("Error occurred in interaction counter")
      }
};
var IsGl = function(accnum){
    var GLTable = project.getOrCreateDataTable("GroupLeaders");
    GLCursor = GLTable.queryRows({vars: {'accountnumber': accnum}});
    if(GLCursor.count()>0){state.vars.IsGL = true}
    else {state.vars.IsGL = false}
    return state.vars.IsGL;
};
var GetBalance = function (client, season){
    var balance = 0;
    var arrayLength = client.BalanceHistory.length;
    for (var i = 0; i < arrayLength; i++) {
        if (client.BalanceHistory[i].SeasonName ==season){balance = client.BalanceHistory[i].Balance}}
};
var ValidPN = function(phonenumber){
    if (phonenumber.length === 10 && phonenumber.substring(0, 2)=="07"){return true}
    else {return false}
};
var IsJITTUDistrict = function (districtname){
    console.log("Checking if district is in JITTU scope: "+ districtname);
    var JITTable = project.getOrCreateDataTable("JIT_Districts");
    DistictCursor = JITTable.queryRows({vars: {'districtname': districtname, 'topup': "1"}});
    if(DistictCursor.count() > 0){state.vars.JITTUDistrict = true}
    else {state.vars.JITTUDistrict = false}
    return state.vars.JITTUDistrict;
};
var IsJITEDistrict = function (districtname){
    var JITTable = project.getOrCreateDataTable("JIT_Districts");
    DistictCursor = JITTable.queryRows({vars: {'districtname': districtname, 'enrollment': "1"}});
    if(DistictCursor.count() > 0){state.vars.JITEdistrict = true}
    else {state.vars.JITEdistrict = false}
    return state.vars.JITEdistrict;
};
var LogSessionID = function(){
    console.log("Unique session id: "+call.id);
};
var TrimClientJSON = function(client){
    var SeasonCount = client.BalanceHistory.length;
    if (SeasonCount>3){client.BalanceHistory.length = 3}
    return client;
};
var GetLang = function(){
    if(contact.vars.English === true){return true} else {return false}
};
var ChangeLang = function (){
    if (contact.vars.English === true){contact.vars.English = false}
    else {contact.vars.English = true}
    contact.save();
};
var RosterClientVal = function (AccNum){
    rosterAPI.verbose = true;
    rosterAPI.dataTableAttach();
    response = rosterAPI.authClient(AccNum,'KE');
    return response;
};
var RosterClientGet = function (AccNum){
    rosterAPI.verbose = true;
    rosterAPI.dataTableAttach();
    client = rosterAPI.getClient(AccNum,'KE');
    return client;
};
var ErrorEmail = function (Subject, Body){
    sendEmail("tom.vranken@oneacrefund.org", Subject, Body);
    sendEmail("rodgers.kweyuh@oneacrefund.org:", Subject, Body);
    sendEmail("charles.lipeyah@oneacrefund.org", Subject, Body);
    sendEmail("Patrick.Biegon@oneacrefund.org", Subject, Body);
    sendEmail("rodrigo.zuolo@oneacrefund.org", Subject, Body);
    sendEmail("larkin.crain@oneacrefund.org", Subject, Body);
};
var RosterColRequest = function (AccNum,Amount){
    rosterAPI.verbose = true;
    rosterAPI.dataTableAttach();
    var phone = {
        country: "KE",
        phone_number: "+"+PhoneNumber.formatInternationalRaw(contact.phone_number, "KE")
    };
    var provider="Beyonic";
    var colResult = rosterAPI.collectPayment(AccNum,Amount , phone, provider);
    console.log(JSON.stringify(colResult));
    if (colResult.Success) {console.log("The user will get PIN authorization form on their phone to pay OAF")}
    else {console.log(colResult.Description + "Try again")}
    call.vars.colreqTimeStamp = moment().format('X');
    return colResult.Success;
};
var LocationNotKnown = function (Location){
    if (Location == "#"|| Location == "0"){
        LocationNotKnownText();
        hangUp();
    }
};
var LocationNext = function (){
    LocArray = JSON.parse(state.vars.LocArray);
    state.vars.MenuNext = false;
    MenuText ="";
    LocMenu = "";
    for (var i = state.vars.MenuCount; i < LocArray.length; i++) {
        var MenuText =LocMenu + LocArray[i].Menu+ ") " + LocArray[i].Name+'\n';
        if(MenuText.length < 65){LocMenu = MenuText}
        else{
            MenuCount = i;
            state.vars.MenuCount = i;
            state.vars.MenuNext = true;
            if (GetLang()){LocMenu= LocMenu+"N) Next"}
            else {LocMenu= LocMenu+"n) Ukurasa Ufwatao"}
            i = 9999}
    }
    return LocMenu;
};
var FOLocatorNextSelect = function(Location){
    if (Location == "n" || Location == "N" || Location =="00"){console.log("Fo locator Next selected");return true}
    else {return false}
};
var ValNationalID = function(input){
    var NumChar = input.length;
    if (NumChar == 7 || NumChar == 8){return true}
    else {return false}
};
var SiteLockVal = function(SiteName, DistrictName){
    var SiteLockingTable = project.getOrCreateDataTable("JIT_SiteLocking");
    var SiteLockingCursor = SiteLockingTable.queryRows({vars: {'districtname': DistrictName,'sitename': SiteName}});
    SiteLockingCursor.limit(1);
    if (SiteLockingCursor.hasNext()) {
        var SiteLockingRow = SiteLockingCursor.next();
        return SiteLockingRow.vars.locked;
        }
    else {return false}
};
var IsPrePayTrialDistrict = function (districtname){
    districtname = districtname.toLowerCase();
    if (districtname == "nyando" || districtname == "kipkelion" || districtname == "chwele"){return true}
    else {return false}
};
var GetPrepaymentAmount = function(client){
    ClientDistrict = client.DistrictName.toLowerCase();
    var prepay = IsPrePayTrialDistrict(ClientDistrict);
    if (prepay){
        var PrePayTable = project.getOrCreateDataTable("PrePayment_IndividualAmounts");
        PrePayCursor = PrePayTable.queryRows({vars: {'accnum': client.AccountNumber}});
        PrePayCursor.limit(1);
        if (PrePayCursor.hasNext()) {
            var PrePayRow = PrePayCursor.next();
            return PrePayRow.vars.prepaymentamount}
        else {sendEmail("charles.lipeyah@oneacrefund.org", "Prepayment amount not found", "Prepayment amount not uploaded from client with acc num :"+ client.AccountNumber+ " in district: "+client.DistrictName);
            return "Error";
        }
    }
    else {return 500}
    // line
};
var FAWActive = function (districtname){
    var Table = project.getOrCreateDataTable("FAW Districts");
    Cursor = Table.queryRows({vars: {'districtname': districtname, 'active': "1"}});
    if (Cursor.count()>0){return true}
    else {return false}
};
var FAWOrdersPlaced = function (accnum){
    var table = project.getOrCreateDataTable("FAWOrders");
    var rowcursor = table.queryRows({vars: {'accountnumber':accnum}});
    var SumOrder = 0;
    while (rowcursor.hasNext()) {
        var row = rowcursor.next();
        SumOrder = SumOrder + parseInt(row.vars.bundlequantity)}
    return SumOrder;
};
var FAWCreateOrder = function(client, order){
    var table = project.getOrCreateDataTable("FAWOrders");
    var row = table.createRow({
        vars: {'accountnumber': client.AccountNumber,
        'date_created': moment().format("DD-MM-YYYY"),
        'districtname':client.DistrictName,
        'globalid':client.GlobalClientId,
        'firstname':client.FirstName,
        'lastname':client.LastName,
        'creditcyclename':CurrentSeasonName,
        'bundlename':"",
        'bundlequantity': order,
        'action':"Insert"}});
    row.save();
};
var EnrolledAndQualified = function (client){
    var arrayLength = client.BalanceHistory.length;
    var Valid = false;
    for (var i = 0; i < arrayLength; i++) {
        if (client.BalanceHistory[i].SeasonName ==CurrentSeasonName){    
            if(client.BalanceHistory[i].TotalCredit> 0){Valid = true}
        }
    }
    return Valid;
};
var JITTUCheckPreviousOrder = function(BundleOption, accnum){
    var JITTUOrdersTable = project.getOrCreateDataTable("JITTU_Orders");
    JITTUOrderPrimaryCursor = JITTUOrdersTable.queryRows({vars: {'bundlename':BundleOption.bundlename ,'accnum': accnum }});
    if (JITTUOrderPrimaryCursor.count()>0){return true}
    else {return false}
};
var JITTUCheckSecondairyOrder = function(BundleOption, accnum){
    var JITTUOrdersTable = project.getOrCreateDataTable("JITTU_Orders");
    var checkrelated = false;
    for (var i = 0; i < BundleOption.relatedbundles.length; i++) {
        var RelatedBundleName = BundleOption.relatedbundles[i].bundlename;
        JITTUOrderRelatedCursor = JITTUOrdersTable.queryRows({vars: {'bundlename': RelatedBundleName ,'accnum': accnum }});
        if (JITTUOrderRelatedCursor.count()>0){checkrelated = true}
    }
    return checkrelated;
};
var JITCheckStockAvailable = function(warehousename, bundlename, checkvarieties){
    var AvailableStock = 0;
    var JITWarehouseTable = project.getOrCreateDataTable("JIT Warehouse stock");
    JITWarehouseCursor = JITWarehouseTable.queryRows({vars: {'warehousename': warehousename,'bundlename': bundlename}});
    JITWarehouseCursor.limit(1);
    if (JITWarehouseCursor.count()>0){
        var valid = false;
        if (checkvarieties){
            if(JITGetVarieties(warehousename).length>0){valid = true}
        }
        else {valid = true}
        if (valid){
            JITWarehouseRow = JITWarehouseCursor.next();
            AvailableStock = JITWarehouseRow.vars.quanityavailable - JITWarehouseRow.vars.quanityordered;
        }
    }
    if (AvailableStock>0){return true}
    else {return false}
};
var JITTUGetOrderCount = function(accnum){
    var JITTUOrdersTable = project.getOrCreateDataTable("JITTU_Orders");
    JITTUOrderCursor = JITTUOrdersTable.queryRows({vars: {'accnum': accnum }});
    return JITTUOrderCursor.count();
};
var JITgetWarehouse = function(districtname){
    var JITDistrictTable = project.getOrCreateDataTable("JIT_Districts");
    JITTUDistrictCursor = JITDistrictTable.queryRows({vars: {'districtname': districtname}});
    JITTUDistrictCursor.limit(1);
    var warehousename = false;
    if (JITTUDistrictCursor.count()>0){
        JITTUDistrictkRow = JITTUDistrictCursor.next();
        warehousename = JITTUDistrictkRow.vars.warehouse;
    }
    return warehousename;
};
var JITTUGetOrderOptions = function (client){
    var accnum = client.AccountNumber;
    var JITTUOrdersAvailable = [];
    var OrderCount = JITTUGetOrderCount (accnum);
    if (OrderCount>=JITTUMaxOrders){
        console.log("already placed maximum number of orders.");
    }
    else{
        var districtname = client.DistrictName;
        var warehousename = JITgetWarehouse(districtname);
        for (var i = 0; i < JITBundleOptions.length; i++) {
            var OrderPreviously = JITTUCheckPreviousOrder(JITBundleOptions[i], accnum);
            var OrderSecondairy = JITTUCheckSecondairyOrder(JITBundleOptions[i], accnum);
            var OptionAvailable = JITCheckStockAvailable(warehousename, JITBundleOptions[i].bundlename,JITBundleOptions[i].variety);
            if (OrderPreviously === false && OrderSecondairy ===false && OptionAvailable){
                console.log(JITBundleOptions[i].bundlename+ "Available");
                var JITTU_order = {
                    'bundlename': JITBundleOptions[i].bundlename,
                    'nameEN': JITBundleOptions[i].nameEN,
                    'nameSW': JITBundleOptions[i].nameSW,
                    'price':JITBundleOptions[i].price,
                    'variety':JITBundleOptions[i].variety,
                    'unitnumber':JITBundleOptions[i].unitnumber
                };
                JITTUOrdersAvailable.push(JITTU_order);
            }
            else{console.log(JITBundleOptions[i].bundlename+ "Not Available")}
        }    
    }   
    state.vars.JITTUOrdersAvailable = JSON.stringify(JITTUOrdersAvailable);
    console.log(state.vars.JITTUOrdersAvailable);
    return JITTUOrdersAvailable;
};
var JITTURetrieveOrders = function (accnum){
    var JITTUOrdersPlaced = [];
    for (var i = 0; i < JITBundleOptions.length; i++) {
        var Ordered = JITTUCheckPreviousOrder(JITBundleOptions[i], accnum);
        if (Ordered){
            var JITTU_order = {
                'bundlename': JITBundleOptions[i].bundlename,
                'nameEN': JITBundleOptions[i].nameEN,
                'nameSW': JITBundleOptions[i].nameSW,
                'price':JITBundleOptions[i].price
            };
            JITTUOrdersPlaced.push(JITTU_order);
        }
    }
    return JITTUOrdersPlaced;
};
var JITECheckPreviousAccNum = function (accnum){
    var PreviousOrder = false;
    var JITETable = project.getOrCreateDataTable("JITE_Orders");
    JITECursor = JITETable.queryRows({vars: {'accountnumber': accnum}});
    if (JITECursor.count()>0){PreviousOrder = true}
    return PreviousOrder;
};
var JITECheckPreviousNationalID = function (nationalid){
    var PreviousOrder = false;
    var JITETable = project.getOrCreateDataTable("JITE_Orders");
    JITECursor = JITETable.queryRows({vars: {'nationalid': nationalid}});
    if (JITECursor.count()>0){PreviousOrder = true}
    return PreviousOrder;
};
var JITTUOrderOverview = function (JIT_client){
    var OrdersPlaced = JITTURetrieveOrders(JIT_client.AccountNumber);
    if(OrdersPlaced.length === 0){
        var BundleOptions = JITTUGetOrderOptions(JIT_client);
        JITBundleSelectText(BundleOptions);
        promptDigits("JITTUBundleSelect", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else{
        JITTUShowOrdersText(OrdersPlaced);
        if (OrdersPlaced.length<JITTUMaxOrders){promptDigits("ContinueToJITTUBundleSelect", {submitOnHash: true, maxDigits: 1, timeout: 5})}
        else{promptDigits("BackToMain", {submitOnHash: true, maxDigits: 1, timeout: 5})}
    }
};
var JITGetVarieties = function(warehousename){
    var JITVarietiesTable = project.getOrCreateDataTable("JIT Warehouse varieties");
    JITVarietiesCursor = JITVarietiesTable.queryRows({vars:{'warehousename': warehousename}});
    var varieties = [];
    while (JITVarietiesCursor.hasNext()){
        var VarietyRow = JITVarietiesCursor.next();
        var available =  VarietyRow.vars.quantityavailable -  VarietyRow.vars.quantityordered;
        if (available>0){
            var variety = VarietyRow.vars.variety;
            varieties.push(variety)}
    }
    state.vars.varieties = JSON.stringify(varieties);
    return varieties;
};
var JITTUCreateOrder = function(client,bundle,variety){
    var warehousename = JITgetWarehouse(client.DistrictName);
    var JITTUOrdersTable = project.getOrCreateDataTable("JITTU_Orders");
    var JITTUOrderRow = JITTUOrdersTable.createRow({
        vars: {
            'DistrictName':client.DistrictName,
            'SiteName': client.SiteName,
            'GlobalClientId': client.GlobalClientId,
            'FirstName': client.FirstName,
            'LastName': client.LastName,
            'CreditCycleName': CurrentSeasonName, 
            'accnum': client.AccountNumber,
            'bundlename': bundle.bundlename,
            'variety':variety,
            'warehousename': warehousename,
            'quantity': 1,
            'action': "insert"
        }
    });
    JITTUOrderRow.save();
    JITUpdateWarehouse(warehousename,bundle.bundlename,variety);
};
var JITEGetOrderOptions = function (){
    var JITEOrdersAvailable = [];
    var districtname = client.DistrictName;
    var warehousename = JITgetWarehouse(districtname);
        for (var i = 0; i < JITBundleOptions.length; i++) {
            if (JITBundleOptions[i].JITE){
                var OptionAvailable = JITCheckStockAvailable(warehousename, JITBundleOptions[i].bundlename,JITBundleOptions[i].variety);
                if (OptionAvailable){
                    var JITE_order =  {
                        'bundlename': JITBundleOptions[i].bundlename,
                        'nameEN': JITBundleOptions[i].nameEN,
                        'nameSW': JITBundleOptions[i].nameSW,
                        'price':JITBundleOptions[i].price,
                        'variety':JITBundleOptions[i].variety,
                        'unitnumber':JITBundleOptions[i].unitnumber
                    };
                JITEOrdersAvailable.push(JITE_order);
            }
            else{console.log(JITBundleOptions[i].bundlename+ "Not Available")}
        }    
    }   
    state.vars.JITEOrdersAvailable = JSON.stringify(JITEOrdersAvailable);
    return JITEOrdersAvailable;
};
var JITECreateOrder = function (accnum,firstname, lastname,nationalid, GLclient,bundleselected,variety, warehousename, phonenumber){
    var JITEOrdersTable = project.getOrCreateDataTable("JITE_Orders");
    var JITEOrderRow = JITEOrdersTable.createRow({
        vars: {
            'accountnumber': accnum,
            'bundlename': bundleselected.bundlename,
            'variety':variety,
            'firstname':firstname,
            'lastname':lastname,
            'nationalid':nationalid,
            'GLAccNum':GLclient.AccountNumber,
            'GLGroup':GLclient.GroupName,
            'GLSite':GLclient.SiteName,
            'GLDistrict':GLclient.DistrictName,
            'warehousename': warehousename,
            'quantity': 1,
            'phonenumber': phonenumber
        }
    });
    JITEOrderRow.save();
    JITUpdateWarehouse(warehousename,bundleselected.bundlename,variety);
};
var JITUpdateWarehouse = function (warehousename,bundlename,variety){
    var table = project.getOrCreateDataTable("JIT Warehouse stock");
    StockCursor = table.queryRows({vars: {'bundlename': bundlename, 'warehousename': warehousename}});
    StockCursor.limit(1);
    var JITTUOrderCount = 0;
    var JITEOrderCount = 0;
    if (StockCursor.hasNext()){
        StockRow = StockCursor.next();
        var JITETable = project.getOrCreateDataTable("JITE_Orders");
        JITECursor = JITETable.queryRows({vars: {'bundlename': bundlename, 'warehousename': warehousename}});
        JITEOrderCount = JITECursor.count();
        var JITTUTable = project.getOrCreateDataTable("JITTU_Orders");
        JITTUCursor = JITTUTable.queryRows({vars: {'bundlename': bundlename, 'warehousename': warehousename}});
        JITTUOrderCount = JITTUCursor.count();
        StockRow.vars.quanityordered = JITEOrderCount+ JITTUOrderCount;
        StockRow.save();
    }
    else {sendEmail("charles.lipeyah@oneacrefund.org ", "JIT Data error", "No stock record found for "+ bundlename+ "in warehouse "+ warehousename+ "Check here to verify https://telerivet.com/p/0c6396c9/data/JIT_20Warehouse_20stock" )}
    for (var i = 0; i < JITBundleOptions.length; i++) {
        console.log(JITBundleOptions[i].bundlename);
        if (JITBundleOptions[i].bundlename == bundlename && JITBundleOptions[i].variety === true){
            var VarTable = project.getOrCreateDataTable("JIT Warehouse varieties");
            VarStockCursor = VarTable.queryRows({vars: {'variety': variety, 'warehousename': warehousename}});
            VarStockCursor.limit(1);
            if (VarStockCursor.hasNext()){
                VarStockRow = VarStockCursor.next();
                VarStockRow.vars.quantityordered = JITEOrderCount*JITBundleOptions[i].unitnumber + JITTUOrderCount*JITBundleOptions[i].unitnumber;
                VarStockRow.save();
            }
            
            else{
                sendEmail("charles.lipeyah@oneacrefund.org ", "JIT Data error", "No stock record found for "+  variety+ "in warehouse "+ warehousename+ "Check here to verify https://telerivet.com/p/0c6396c9/data/JIT_20Warehouse_20varieties" );
            }
        }
    }
};
var SHSActive = function (districtname){
    var Table = project.getOrCreateDataTable("SHS Districts");
    Cursor = Table.queryRows({vars: {'districtname': districtname, 'active': "1"}});
    if (Cursor.count()>0){return true}
    else {return false}
};
var SHSValidateReg = function(client, seasonname){
    var valid = false;
        var OrdersTable = project.getOrCreateDataTable("SHS orders");
        OrderCursor = OrdersTable.queryRows({vars: {'accountnumber': client.AccountNumber, 'season': seasonname}});
        if (OrderCursor.count()>0){
            valid = true;
            var row = OrderCursor.next();
            state.vars.SHS_Type = row.vars.shs_type;
        }
    return valid;
};
var SHSValidateSerial = function(accountnumber,serialnumber, type){
    var CheckStatus = function (SerialCursor){
        var status = "";
        if (SerialCursor.count() === 0){status = "NotFound"}
        else if (SerialCursor.count() === 1){
            SerialRow = SerialCursor.next();
            if (SerialRow.vars.assigned){
                if (SerialRow.vars.accountnumber == accountnumber){status = "RegAccNum"}
                else {status = "RegOther"}
            }
            else {status = "NotReg"}
        }
        else {status = "MultipleFound"}
        return status;
    };
    var status = "";
    var Serialtable = project.getOrCreateDataTable("SHS Serial Numbers");
    if (typeof type === "undefined"){
        SerialCursor = Serialtable.queryRows({vars: {'serial_number' :serialnumber, 'season': CurrentSeasonName}});
        return CheckStatus(SerialCursor);
    }
    else {
        SerialCursor = Serialtable.queryRows({vars: {'serial_number' :serialnumber, 'shs_type': type, 'season': CurrentSeasonName}});
        return CheckStatus(SerialCursor);
    }
};
var SHSRegThisSeason= function(accountnumber){
    var table = project.getOrCreateDataTable("SHS Serial Numbers");
    Cursor = table.queryRows({vars: {'accountnumber': accountnumber, 'season': CurrentSeasonName}});
    if(Cursor.count() > 0){return true}
    else {return false}
};
var SHSRegSerial = function(client,serialnumber, type){
    var RegSerial = function (SerialCursor, client){
        SerialRow = SerialCursor.next();
        SerialRow.vars.accountnumber = client.AccountNumber;
        SerialRow.vars.date_assigned = moment().format("DD-MM-YYYY");
        SerialRow.vars.district = client.DistrictName;
        SerialRow.vars.site = client.SiteName;
        SerialRow.vars.group = client.GroupName;
        SerialRow.vars.assigned = true;
        SerialRow.save();
    };
    var Serialtable = project.getOrCreateDataTable("SHS Serial Numbers");
    if (typeof type === "undefined"){
        SerialCursor = Serialtable.queryRows({vars: {'serial_number' :serialnumber, }});
        RegSerial(SerialCursor, client);
    }
    else {
        SerialCursor = Serialtable.queryRows({vars: {'serial_number' :serialnumber, 'shs_type': type}});
        RegSerial(SerialCursor, client);
    }
};
var GetSHSDetails = function(accountnumber, serialnumber, type){
        var SerialInfo = function (SerialCursor){
        if (SerialCursor.hasNext()){
            SerialRow = SerialCursor.next();
            var SerialReturn = {
                'Status': "Found",
                'ActivationCode': SerialRow.vars.activation_code,
                'UnlockCode': SerialRow.vars.unlockcode, 
                'season': SerialRow.vars.season
            };
            return SerialReturn;
        }
        else {return "Not found"}

    };
    var Serialtable = project.getOrCreateDataTable("SHS Serial Numbers");
    if (typeof type === "undefined"){
        SerialCursor = Serialtable.queryRows({vars: {'serial_number' :serialnumber,'accountnumber': accountnumber }});
        return SerialInfo(SerialCursor);
    }
    else {
        SerialCursor = Serialtable.queryRows({vars: {'serial_number' :serialnumber, 'shs_type': type, 'accountnumber': accountnumber}});
        return SerialInfo(SerialCursor);
    }
};
var GetSerialForClient = function (accountnumber){
    var table = project.getOrCreateDataTable("SHS Serial Numbers");
    Cursor = table.queryRows({vars: {'accountnumber': accountnumber}});
    var SerialList = [];
    while (Cursor.hasNext()) {
        var row = Cursor.next();
        var Serial = {
            "SerialNumber":row.vars.serial_number,
            "Season": row.vars.season,
        };
        SerialList.push(Serial); 
    }
    return SerialList;
};
var SHSShowCode = function(client,serial,type){
    var SHSDetail = "";
    if (typeof type === "undefined"){SHSDetail = GetSHSDetails(client.AccountNumber, serial)}
    else {SHSDetail = GetSHSDetails(client.AccountNumber, serial,type)}
    if (SHSDetail == "NotFound"){return false}
    else{
        var arrayLength = client.BalanceHistory.length;
        for (var i = 0; i < arrayLength; i++) {
            if (client.BalanceHistory[i].SeasonName == SHSDetail.season){
                if (client.BalanceHistory[i].Balance>0){
                    state.vars.SHSCode = SHSDetail.ActivationCode;
                    SHSActivationCodeText(SHSDetail.ActivationCode);
                    SHSCodeSMS(SHSDetail.ActivationCode);
                    promptDigits("SHSCodeContinue", {submitOnHash: true, maxDigits: 1, timeout: 5});
                    return true;
                }
                else {
                    state.vars.SHSCode = SHSDetail.UnlockCode;
                    SHSUnlockText(SHSDetail.UnlockCode, SHSDetail.season);
                    SHSCodeSMS(SHSDetail.UnlockCode);
                    promptDigits("SHSCodeContinue", {submitOnHash: true, maxDigits: 1, timeout: 5});
                    return true;
                }
            }
            else {return false}
        }
    }
};
var CallBackCreate = function(client,phonenumberCB,type){
    var CEEmail = "kenya.help@oneacrefund.org";
    var Subject = "Call back requested for: "+type;
    var Body = "call back number: "+ phonenumberCB+ "\n issuetype: "+ type+ "\n Account number: "+ client.AccountNumber+ "\nDistrict: "+ client.DistrictName+ "\nSite: "+ client.SiteName+ "\nGroup: "+ client.GroupName;
    sendEmail(CEEmail, Subject, Body);
};
var LocationNext = function (){
    LocArray = JSON.parse(state.vars.LocArray);
    console.log(state.vars.LocArray);
    state.vars.MenuNext = false;
    MenuText ="";
    LocMenu = "";
    for (var i = state.vars.MenuCount; i < LocArray.length; i++) {
        var MenuText =LocMenu + LocArray[i].Menu+ ") " + LocArray[i].Name+'\n';
        if(MenuText.length < 110){LocMenu = MenuText}
        else{
            MenuCount = i;
            state.vars.MenuCount = i;
            state.vars.MenuNext = true;
            if (GetLang()){LocMenu= LocMenu+"0) Next"}
            else {LocMenu= LocMenu+"0) Ukurasa Ufwatao"}
        i = 9999;
        }
    }
    return LocMenu;
};
var HospitalTownsRetrieve = function(regionid){
    LocMenu = "" ;
    var LocTable = project.getOrCreateDataTable("Hospital_Towns");
    TownList = LocTable.queryRows({vars: {'regionid': regionid}});
    var TownArray = []; 
    while (TownList.hasNext()) {
        var TownRow = TownList.next();
        var Location = {
            "Name": TownRow.vars.name,
            "ID": TownRow.vars.id,
            "Menu": TownRow.vars.id.substring(regionid.length+1)
        };
        TownArray.push(Location); 
    }
    TownArray.sort(function(a, b){return a.Menu-b.Menu});
    state.vars.LocArray = JSON.stringify(TownArray);
    console.log(JSON.stringify(TownArray));
    LocMenu = "";
    MenuCount = 0;
    MenuNext = false;

    for (var i = MenuCount; i < TownArray.length; i++) {
        console.log("Building menu text");
        var MenuText = LocMenu + TownArray[i].Menu+ ") "+ TownArray[i].Name+'\n';
        console.log(MenuText.length);
        if(MenuText.length < 110){
            LocMenu = MenuText;
        }
        else{
            MenuCount = i;
            state.vars.MenuCount = i;
            state.vars.MenuNext = true;
            if (GetLang()){LocMenu = LocMenu+"0) Next"}
            else {LocMenu= LocMenu+"0) Ukurasa Ufwatao"}
            i = 9999;
        }
    }
    return LocMenu;
};
var ValidateHostitalInput = function(input){
    LocValid = false;
    LocArray = JSON.parse(state.vars.LocArray);
    console.log(LocArray);
    for (var i = 0; i < LocArray.length; i++) {
        if (LocArray[i].Menu == input) {
            state.vars.locID = LocArray[i].ID;
            LocValid = true;
        }
    }
    return LocValid;
};
var HospitalsRetrieve = function(townid){
    LocMenu = "" ;
    var LocTable = project.getOrCreateDataTable("Hospital_Hospitals");
    HospitalList = LocTable.queryRows({vars: {'townid': townid}});
    console.log(HospitalList.count());
    var HospitalArray = []; 
    while (HospitalList.hasNext()) {
        var HosRow = HospitalList.next();
        var Location = {
            "Name": HosRow.vars.name,
            "ID": HosRow.vars.id,
            "Menu": HosRow.vars.id.substring(townid.length+1)
        };
        HospitalArray.push(Location); 
    }
    HospitalArray.sort(function(a, b){return a.Menu-b.Menu});
    console.log(JSON.stringify(HospitalArray));
    state.vars.LocArray = JSON.stringify(HospitalArray);
    LocMenu = "";
    MenuCount = 0;
    MenuNext = false;
    for (var i = MenuCount; i < HospitalArray.length; i++) {
        var MenuText = LocMenu + HospitalArray[i].Menu+ ") "+ HospitalArray[i].Name+'\n';
        console.log(MenuText.length);
        if(MenuText.length < 110){LocMenu = MenuText}
        else{
            MenuCount = i;
            state.vars.MenuCount = i;
            state.vars.MenuNext = true;
            if (GetLang()){LocMenu = LocMenu+"0) Next"}
            else {LocMenu= LocMenu+"0) Ukurasa Ufwatao"}
            i = 9999;
        }
    }
    return LocMenu;
};
var InsuranceActive = function (districtname){
    var Table = project.getOrCreateDataTable("District Service access");
    Cursor = Table.queryRows({vars: {'districtname': districtname, 'insurance': "1"}});
    if (Cursor.count()>0){return true}
    else {return false}
};
var ValidPayRollID = function(payrollid){
    var Table = project.getOrCreateDataTable("Staff");
    Cursor = Table.queryRows({vars: {'payrollid': payrollid}});
    if (Cursor.count()>0){return true}
    else {return false}
};

var GetStaffDetails = function(payrollid){
    console.log("Retrieving details for payroll id: "+ payrollid)
    var Table = project.getOrCreateDataTable("Staff");
    Cursor = Table.queryRows({vars: {'payrollid': payrollid}});
    Cursor.limit(1);
    if (Cursor.hasNext()){
        var Row = Cursor.next();
        var StaffDetail = {
            'name': Row.vars.firstname,
            'email': Row.vars.emailadress,
            'payrollid': Row.vars.payrollid,
        };
        return StaffDetail;
    }
    else {return false}
}

var StaffCreateRequest = function(payrollid,startday,amount){
    var Table = project.getOrCreateDataTable("Staff_AbsenceRequest");
    var startdaydesc = "Today";
    if (startday == 2){startdaydesc = "Yesterday"}
    else if (startday == 3){startdaydesc = "Tomorrow"}
    var Row = Table.createRow({
        vars: {
            'payrollid':payrollid,
            'startday':startdaydesc,
            'amount': amount
        }
    });
    Row.save();
};

//MAIN FUNCTIONS OR GENERIC TEXT
var SplashMenuText = function (){
    if (GetLang()){sayText("Welcome to the OAF portal. Please enter the 8 digit account number you use for repayment\nPress 0 if you are not our client\n99) Swahili")}
    else {sayText("Karibu kwenye huduma ya One Acre Fund. Tafadhali bonyenza nambari zako 8 za akaunti. \nBonyeza 0 ikiwa wewe si mkulima\n99) English")}
};
var SplashMenuFailure = function (){
    if (GetLang()){sayText("Welcome to the OAF portal. Please enter the 8 digit account number you use for repayment\nPress 0 if you are not our client\n99) Swahili")}
    else {sayText("Karibu kwenye huduma ya One Acre Fund. Tafadhali bonyenza nambari zako 8 za akaunti.\nBonyeza 0 ikiwa wewe si mkulima\n99) English")}
};
var MainMenuText = function (client){
    var MenuText = "";
    if (GetLang()){MenuText ="Select Service\n1) Make a payment\n2) Check balance"}
    else {MenuText ="Chagua Huduma\n1) Fanya malipo\n2) Kuangalia salio"}
    var JITActive = true;
    var FAWActiveCheck = true;
    if (IsGl(client.AccountNumber)){
        if (IsJITTUDistrict(client.DistrictName)){
            if (GetLang()){MenuText = MenuText + "\n3) Top Up"}
            else {MenuText = MenuText + "\n3) Top Up"}
        }
        if (IsJITEDistrict(client.DistrictName)){
            if (GetLang()){MenuText = MenuText + "\n4) Enroll"}
            else {MenuText = MenuText + "\n4) Enroll"}
        }
    }
    if (IsPrePayTrialDistrict(client.DistrictName)){
        if (GetLang()){MenuText = MenuText + "\n5) Prepayment amount"}
        else {MenuText = MenuText + "\n5) Malipo ya kufuzu"}
    }
    if (FAWActive(client.DistrictName&&EnrolledAndQualified(client))){
        if (GetLang()){MenuText = MenuText + "\n6) FAW Pesticide Order"}
        else {MenuText = MenuText + "\n6) Kuagiza dawa ya FAW"}
    }
    if (SHSActive(client.DistrictName)){
        if (GetLang()){MenuText = MenuText + "\n7) SHS"}
        else {MenuText = MenuText + "\n7) SHS"}
    }
    if (GetLang()){MenuText = MenuText + "\n8) Insurance"}
    else {MenuText = MenuText + "\n8) Bima"}
    
    if (GetLang()){MenuText =MenuText + "\n99) Swahili"}
    else {MenuText =MenuText + "\n99) English"}
    sayText(MenuText);
};
var PaymentMenuText = function (AccNum){
    if (GetLang()){sayText("You are paying into account number "+AccNum+".\nPlease reply with the amount you want to pay")}
    else {sayText("Unafanya malipo kwa hii akaunti "+AccNum+".Tafadhali weka kiasi unachotaka kulipa")}
};
var CheckBalanceMenuText = function (Overpaid,Season,Credit,Paid,Balance){
    if (GetLang()){
        if(Overpaid){sayText(Season+":\nPaid: "+Paid+"\nTotal credit: "+Credit+"\nOver payment: "+Balance+ "\n1 - Make payment")}
        else {sayText(Season+":\nPaid: "+Paid+"\nTotal credit: "+Credit+"\nRemaining: "+Balance+ "\n1 - Make payment")}
    }
    else{
        if(Overpaid){sayText(Season+":\nJumla ya malipo: "+Paid+"\nJumla ya mkopo: "+Credit+"\nMalipo kwa mkopo unaofuata: "+Balance+ "\n1 - Fanya malipo")}
        else {sayText(Season+":\nPaid: "+Paid+"\nTotal credit: "+Credit+"\nSalio: "+Balance+ "\n1 - Fanya malipo")}
    }
    var BalanceInfo = "Balance: "+Balance+ "\nSeason: "+Season+ "\nCredit: "+Credit+ "\nPaid: "+Paid+ "\nOverpaid: "+Overpaid;
    call.vars.BalanceInfo = BalanceInfo;
};
var PaymentSuccessText = function (){
    if (GetLang()){sayText("Please confirm the transaction by typing in your MPesa PIN in the pop up that will appear. Thank you")}
    else {sayText("Tafadhali thibitisha malipo yako kwa kubonyeza nambari yako ya siri ya Mpesa. Asante")}
};
var PaymentFailureText = function (){
    if (GetLang()){sayText("An unexpected error occurred, please try again by dialing *689#")}
    else {sayText("Kuna hitilafu ya mitambo. Tafadhali jaribu tena kwa kubonyeza *689#")}
};
var PaymentRetryText = function (){
    if (GetLang()){sayText("Please enter correct amount. Pay 10 KSHs or more.")}
    else {sayText("Tafadhali weka kiasi sahihi. Fanya malipo ya Shillingi kumi (KSHs 10) au zaidi.")}
};
var PrepaymentNotEnrolledText = function(){
    if (GetLang()){sayText("You are not enrolled this season\n1) Back to menu")}
    else {sayText("Hujasajiliwa msimu huu\n1) Rudi kwenye menyu")}
};
var PrepaymentMenuText = function(prepayment, paid){
    console.log("Already paid: "+paid);
    if(prepayment == "Error"){
        ;
        if (GetLang()){sayText("An error occured.\n1) Back to menu")}
        else {sayText("Kosa limetokea.\n1) Rudi kwenye menyu")}
    }
    else{
        var Remaining = Math.max(0,prepayment - paid);
        // You have paid KESXX. your prepayment balance to qualify is now KESXX
        if (GetLang()){sayText("You have paid KES"+paid +". Your prepayment balance to qualify is now KES "+Remaining+"\n1) Back to menu")}
        else {sayText("Umelipa KES"+paid +". Salio lako la malipo ya kufuzu ni KES "+Remaining+"\n1) Rudi kwenye menyu")}
    }
};
var CallMeBackText = function(){
    if (GetLang()){sayText("Please reply with the number you want to be called back on\n1) Use currect number\n9) Back to menu")}
    else {sayText("Tafadhali jibu kwa nambari ya simu utakayo pigiwa nayo.\n1) Kutumia nambari unayo tumia sasa\n9) Rudi hadi mwanzo")}
};
var CallMeBackConfirmText = function(){
    if (GetLang()){sayText("Thank you for reaching out to CE an agent will call you back between 8am and 5pm.\n1) Back to menu")}
    else {sayText("Asante kwa kutuma ombi lako kwetu. Mhudumu wetu atawasiliana nawe kati ya saa mbili asubuhi na saa kumi na moja jioni\n1) Rudi Hadi Mwanzo")}
};
var LoanNotRepaidText = function(season){
    if (GetLang()){sayText("your loan for "+season+" is not fully repaid\n1) Back to menu")}
    else {sayText("your loan for "+season+" is not fully repaid\n1) Back to menu")}
};
// SHS
var SHSMenuText = function(){
    if (GetLang()){sayText("1) Get Activation Code\n2) Get Unlock Code (100% repaid)\n9) Back to main\n99) Report issue")}
    else {sayText("1) Kupata kodi ya kuwasha taa\n2) Kupata Kodi ya kuwasha taa milele (100% repaid)\n9) Rudi Hadi Mwanzo\n99) Kwa shida Yoyote")}
};
var SHSRegNoOrderText = function(){
    if (GetLang()){sayText("You did not order an SHS this season.\n9) Back to main\n99) Report issue")}
    else {sayText("Hukujiandikisha taa yoyote ya SHS mwaka Huu\n9) Rudi hadi mwanzo\n99) Kwa shida Yoyote")}
};
var SHSSerialText = function(){
    if (GetLang()){sayText("Please enter the serial number.\n9) Back to main")}
    else {sayText("Tafadhali weka nambari ya taa  yako\n9) Rudi hadi mwanzo")}
};
var SHSNotQualifiedText= function(){
    if (GetLang()){sayText("You have not qualified and thus cannot register.\n9) Back to main\n99) Report issue")}
    else {sayText("Hujahitimu na hivyo huwezi kusajili\n9) Rudi hadi mwanzo\n99) Kwa shida Yoyote")}
};
var SHSRegOtherText= function(){
    if (GetLang()){sayText("This SHS is already registered to somebody else\n9) Back to main\n99) Report issue")}
    else {sayText("Taa hii Imesajiliwa na mkulima mwingine\n9) Rudi Hadi Mwanzo\n99) Kwa shida Yoyote")}
};
var SHSTypeText = function(){
    if (GetLang()){sayText("Select type:\n1) Sun King Home\n2) Biolite home\n9) Back to main")}
    else {sayText("Chagua aina ya taa:\n1) Sun King Home\n2) Biolite Home System\n9) Rudi Hadi Mwanzo")}
};
var SHSSerialNotValidText = function(){
    if (GetLang()){sayText("Invalid input.\nPlease enter the serial number.\n9) Back to main\n99) Report issue")}
    else {sayText("Nambari sio sahihi:\nTafadhali weka nambari ya taa\n9) Rudi hadi mwanzo\n99) Kwa shida Yoyote")}
};
var SHSActivationCodeText = function(activationcode){
    if (GetLang()){sayText("Thank you. Your Activation code is: "+activationcode+"\n9) Back to main")}
    else {sayText("Asante. Kodi ya kuwasha taa yako ni:"+activationcode+"\n9) Kurudi Hadi Mwanzo")}
};
var SHSUnlockText = function(unlockcode, seasonname){
    if (GetLang()){sayText("You have completed your loan for "+seasonname+"\nYour unlock code is: "+unlockcode+"\n9) Back to main")}
    else {sayText("Umemaliza malipo ya "+seasonname+"\nKodi ya Kufungua taa yako miliele ni: "+unlockcode+"\n9) Rudi hadi mwanzo")}
};
var SHSCodeSMS = function(shscode){
    var SMSText = "";
    if (GetLang()) {SMSText = "Your solar code is: "+shscode}
    else {SMSText = "Kodi ya taa yako ni: "+shscode}
    var Label = project.getOrCreateLabel("SHS Code SMS");
    var sent_msg = project.sendMessage({
        content:  SMSText ,
        to_number:contact.phone_number,
        route_id: RouteIDPush,
        label_ids : [Label.id]
    });    
};
// FAW
var FAWMaxOrderText = function(numberordered){
    if (GetLang()){sayText("Sorry, you have already ordered "+numberordered+" pesticide bottles. You are not allowed to order more.\n1) Back to main")}
    else {sayText("Samahani, umeshatuma ombi la chupa "+numberordered+" za dawa. Hauruhusiwi kuagiza zaidi\n1) Rudi mwanzo wa menu")}
};
var FAWOrderText = function(remainorders, alreadyordered){
    var FAWOrderText = "";
    for (var i = 0; i <remainorders; i++) {
        var MenuItem = i+1;
        var Price = MenuItem * FAWUnitPrice;
        if (GetLang()){FAWOrderText = FAWOrderText + MenuItem+ ") " +MenuItem + " Bottle - "+ Price+ "KSH\n"}
        else {FAWOrderText = FAWOrderText + MenuItem+ ") " +MenuItem + " Chupa - "+ Price+ "KSH\n"}
    }
    if (GetLang()){sayText("Orders already placed: "+alreadyordered+ "\nSelect additional order:\n"+FAWOrderText+ "9) Back to main")}
    else {sayText("Agizo ulizoshaweka: "+alreadyordered+ "\nChagua kiwango unachotaka kuagiza:\n"+FAWOrderText+ "9) Rudi mwanzo wa menu")}

};
var FAWConfirmText = function (order){
    var Credit = order* FAWUnitPrice;
    if (GetLang()){sayText("Please confirm of "+ order+ " bottles.\n1) Confirm\n9) Back to main")}
    else {sayText("Tafadhali Hakikisha ni chupa "+ order+ " ya dawa.\n1) Hakikisha\n9) Rudi mwanzo wa menu")}
};
var FAWSuccessText = function (order){
    var Credit = order* FAWUnitPrice;
    if (GetLang()){sayText("Thanks for ordering "+ order+ " bottles. Your FO will deliver the pesticide within a few weeks. An amount of "+Credit+" KSH will be added to your credit.\n9) Back to main")}
    else {sayText("Asante kwa kuagiza chupa "+ order+ ". Mwalimu wako atakuletea dawa zako kwa wiki chache zijazo. Kiasi cha KSH "+Credit+" kitaongezwa kwa mkopo wako.\n9) Rudi mwanzo wa menu")}
};
var FAWSuccessSMS = function(order){
    var Credit = order* FAWUnitPrice;
    var SMStext = "";
    if (GetLang()){SMStext = "Thanks for ordering "+ order+ " bottles. Your FO will deliver the pesticide within a few weeks. An amount of "+Credit+" KSH will be added to your credit."}
    else {SMSText = "Asante kwa kuagiza chupa "+ order+ ". Mwalimu wako atakuletea dawa zako kwa wiki chache zijazo. Kiasi cha KSH "+Credit+" kitaongezwa kwa mkopo wako."}
    var Label = project.getOrCreateLabel("FAW Order Confirm");
    var sent_msg = project.sendMessage({
        content:  SMStext ,
        to_number:contact.phone_number,
        route_id: RouteIDPush,
        label_ids : [Label.id]
    });
};
// JIT TU
var JITTUSiteLockedText = function(){
    if (GetLang()){sayText("We do not accept any orders anymore.\nReply with accountnumber to view order\n1) Back to menu")}
    else {sayText("Hatukubali agizo ya bidhaa yoyote tena.Jibu na nambari ya akaunti kuangalia agizo\n1) Rudi kwa menu")}
};
var JITTUAccNumText = function(){
    if (GetLang()){sayText("Please reply with the account number of the farmer who want to top-up.")}
    else {sayText("Tafadhali jibu na nambari ya akaunti ya mkulima kuongeza bidhaa.")}
};
var JITTUNotEnrolled = function(){
    if (GetLang()){sayText("Farmer is not enrolled this season. Please try again\n1)Back to menu")}
    else {sayText("Mkulima hajaandikishwa muhula huu. Tafadhali jaribu tena\n1) Rudi kwa menu")}
};
var JITTUAccNumNotValidText = function(){
    if (GetLang()){sayText("Account number is not valid. Please try again\n1)Back to menu")}
    else {sayText("Nambari ya akaunti sio sahihi. Tafadhali jaribu tena.\n1) Rudi kwa menu")}
};
var JITTUPrepaymentNotValidText = function(paid,prepayment){
    var remaining = prepayment - paid;
    if (GetLang()){sayText("You do not qualify for a top up, pay at least "+ prepayment +" to qualify. Pay "+ remaining + " to reach "+ prepayment)}
    else {sayText("Bado haujahitimu kuongeza bidhaa, lipa "+ prepayment +"  kuhitimu. Lipa "+ remaining + " ili ufikishe "+ prepayment)}
};
var JITBundleSelectText = function(bundleoptions){
    if (bundleoptions.length ===0){
        if (GetLang()) {sayText("No more options available\n9) back to menu")}
        else {sayText("Hakuna chaguzi/bidhaa zingine zinazopatikana.\n9) Rudi kwa menu")}
    }
    else{
        var BundleSelectText = "";
        for (var i = 0; i < bundleoptions.length; i++) {
            var MenuNumber = i+1;
            if (GetLang()) {BundleSelectText = BundleSelectText+ MenuNumber+") "+ bundleoptions[i].nameEN+ " - "+  bundleoptions[i].price+"\n"}
            else {BundleSelectText = BundleSelectText+ MenuNumber+") "+ bundleoptions[i].nameSW+ " - "+  bundleoptions[i].price+"\n"}
        }
        if (GetLang()){sayText(BundleSelectText+"\n9) Back to Menu")}
        else {sayText(BundleSelectText+"\n9) Rudi Nyuma")}
    }
};
var JITTUOrderOverviewSMS= function(orderoverview, accountnumber, phonenumber){
    var OrderOverviewText = "";
    if (GetLang()) {OrderOverviewText = "Orders added to account: "+ accountnumber+":\n"}
    else {OrderOverviewText =  "Bidhaa zilizo ongezwa kwa akauti: "+ accountnumber+": \n"} 
    var NumberOrders = orderoverview.length;
    for (var i = 0; i < NumberOrders; i++) {
            if (GetLang()) {
                OrderOverviewText = OrderOverviewText+ orderoverview[i].nameEN+ " - "+ orderoverview[i].price+"KSH\n";
            }
            else {
                OrderOverviewText = OrderOverviewText+ orderoverview[i].nameSW+ " - "+ orderoverview[i].price+"KSH\n";
            }
        }
    var Label = project.getOrCreateLabel("JIT-TU OrderOverview");
    var sent_msg = project.sendMessage({
        content:  OrderOverviewText ,
        to_number: phonenumber,
        route_id: RouteIDPush,
        label_ids : [Label.id]
    });    
    return OrderOverviewText;
};
var JITTUShowOrdersText = function(orderoverview){
    var NumberOrders = orderoverview.length;
    console.log("Building order overview text. Number of orders placed: "+NumberOrders);
    var OrderOverviewText = "";
    if (NumberOrders === 0){
        if (GetLang()){sayText("No top up orders placed.")}
        else {sayText("No top up orders placed")}
    }
    else {
        for (var i = 0; i < NumberOrders; i++) {
            if (GetLang()) {OrderOverviewText = OrderOverviewText+ orderoverview[i].nameEN+ " - "+ orderoverview[i].price+"\n"}
            else {OrderOverviewText = OrderOverviewText+ orderoverview[i].nameSW+ " - "+ orderoverview[i].price+"\n"}
        }
        if (NumberOrders<JITTUMaxOrders){
            if (GetLang()) {sayText("Orders placed:\n"+ OrderOverviewText+"\n1) Add product\n2) Finish ordering")}
            else {sayText("Bidhaa ulizo agiza:\n"+ OrderOverviewText+ "1) Ongeza bidhaa\n2) Maliza ombi")}
        }
        else{
            if (GetLang()){sayText("Orders placed:\n"+OrderOverviewText+"\n2) Finish ordering")}
            else {sayText("Bidhaa ulizo agiza:\n"+OrderOverviewText+"\n2) Maliza ombi")}
        }
    }
};
var JITTUNotEnrolled = function(){
    if (GetLang()){sayText("Farmer is not enrolled this season. Please try again\n1)Back to menu")}
    else {sayText("Mkulima hajaandikishwa muhula huu. Tafadhali jaribu tena.\n1) Rudi kwa menu")}
};
var JITTUVarietySelectText = function (varieties){
    var varietiestext = "";
    for (var i = 0; i < varieties.length; i++) {
        var menu = i+1;
        varietiestext = varietiestext+menu+") "+varieties[i]+ "\n";
    }
    if (GetLang()){sayText("Select seed variety:\n"+  varietiestext+ "\n9)Back to menu")}
    else {sayText("Chagua mbegu:\n"+ varietiestext+ "n\n9) Rudi kwa menu")}
};
var JITTU_JITEClientText = function(){
    if (GetLang()){sayText("This farmer is registered through JIT enrollement. They cannot top up.\n1)Back to menu")}
    else {sayText("Mkulima huyu amesajiliwa kupitia JiT. Hawezi ongeza bidhaa zaidi.\n1) Rudi kwa menu")}
};
var JITTUOrderConfrimText = function(bundlename,variety){
    if (GetLang()){sayText("Top up with "+bundlename+" and "+ variety+".\n1) Confrim\n9) Cancel")}
    else {sayText("Umeogeza "+bundlename+" na "+ variety+".\n1) Thibitisha\n9) Futa")}
};
var JITTUOrderNoVarConfrimText = function(bundlename){
    if (GetLang()){sayText("Top up with "+bundlename+".\n1) Confrim\n9) Cancel")}
    else {sayText("Top up with "+bundlename+".\n1) Confrim\n9) Cancel")}
};
var JITTUOrderedText = function (){
    if (GetLang()){sayText("Thank you for placing your Just in Time Top-up order.")}
    else {sayText("Asante kwa kutuma maombi yako ya Just in Time Top-up.")}
};
// JIT E
var JITEAccNumText = function(){
    if (GetLang()){sayText("Please reply with the account number of the farmer who want to enroll\n0) For new client.")}
    else {sayText("Tafadhali jibu na nambari ya akaunti ya mkulima anayetaka kujiandikisha.\n0) kwa mkulima mgeni")}
};
var JITEAccNumNotValidText = function(){
    if (GetLang()){sayText("Not valid\nPlease reply with the account number of the farmer\n0) For new client.")}
    else {sayText("Sio sahihi\nTafadhali jibu na nambari ya akaunti ya mkulima\n0) kwa mkulima mgeni")}
};
var JITEAccNumAlreadyEnrolledText = function(){
    if (GetLang()){sayText("This accountnumber already belongs to an enrolled client.\n1)Go back to main menu")}
    else {sayText("Nambari hii ya akaunti ni ya mteja aliyeandikishwa.\n1) Rudi kwenye menu kuu")}
};
var JITEFirstNameText = function (){
    if (GetLang()){sayText("Please reply with the first name of the member you want to add to your group")}
    else {sayText("Tafadhali jibu na jina ya kwanza ya memba unayetaka kuongeza kwa kikundi chako")}
};
var JITELastNameText = function (){
    if (GetLang()){sayText("Please reply with the second name of the member you want to add to your group")}
    else {sayText("Tafadhali jibu na jina ya pili ya memba unayetaka kuongeza kwa kikundi chako")}
};
var JITENationalIDText = function(){
    if (GetLang()){sayText("What is their national ID?")}
    else {sayText("Namba yao ya kitambulisho ni gani?")}
};
var JITEBundleSelectText = function(bundleoptions){
    if (bundleoptions.length ===0){
        if (GetLang()) {sayText("No more options available\n9) back to menu")}
        else {sayText("No more options available\n9) back to menu")}
    }
    else{
        var BundleSelectText = "";
        for (var i = 0; i < bundleoptions.length; i++) {
            var MenuNumber = i+1;
            if (GetLang()) {BundleSelectText = BundleSelectText+ MenuNumber+") "+ bundleoptions[i].nameEN+ " - "+  bundleoptions[i].price+"\n"}
            else {BundleSelectText = BundleSelectText+ MenuNumber+") "+ bundleoptions[i].nameSW+ " - "+  bundleoptions[i].price+"\n"}
        }
        if (GetLang()){sayText("Select maize acreage.\n"+BundleSelectText+"\n9) Back to Menu")}
        else {sayText("Select maize acreage.\n"+BundleSelectText+"\n9) Back to Menu")}
    }
};
var JITENationalInvalidText = function(){
    if (GetLang()){sayText("Invalid entry.\nPlease enter a valid national id.")}
    else {sayText("Usajili usiosahihi\nTafadhali weka nambari sahihi ya kitambulisho")}
};
var JITESiteLockedText = function(){
    if (GetLang()){sayText("As the delivery date is approaching we do not accept any orders anymore.\n1) Back to menu")}
    else {sayText("Wakati wa kupokea bidhaa unapowadia hatukubali tena agizo ya bidhaa yoyote\n1) Rudi kwa menu")}
};
var JITEAlreadyOrderedText = function(){
    if (GetLang()){sayText("This person already placed an order.\n1) Back to menu")}
    else {sayText("Mtu huyu tayari ameweka agizo/ ameitisha bidhaa\n1) Rudi kwa menu")}
};
var JITEOrderConfrimText = function(bundlename,variety){
    if (GetLang()){sayText("The client has enrolled with "+bundlename+" and "+ variety+".\nReply with their Phonenumber to confrim\n9) Cancel")}
    else {sayText("Mkulima amejisajili na "+bundlename+" na "+ variety+".\nWeka nambari ya simu ya mkulima ili kudhibitisha maombi\n9) Futa maombi")}
};
var JITEOrderConfrimSMS = function(phonenumber, bundlename,variety){
    var SMSText = "";
    if (GetLang()){SMSText="Thanks for ordering "+bundlename+ " of seed type "+ variety+". Make sure you pay KSH 500 qualification amount to receive input on input delivery day."}
    else {SMSText="Asante kwa kujisajili na "+bundlename+ " na "+ variety+". Hakikisha umelipa shilingi 500 ilikupokea bidhaa siku yakupokea pembejeo."}
    var Label = project.getOrCreateLabel("JIT-E confirm");
    var sent_msg = project.sendMessage({
        content:  SMSText,
        to_number: phonenumber,
        route_id: RouteIDPush,
        label_ids : [Label.id]
    });
};
var JITEOrdeCloseText = function(){
    if (GetLang()){sayText("Thanks for enrolling with One Acre Fund through Just in Time.")}
    else {sayText("Asante kwa kujisajili na One acre Fund kupitia Just in Time.")}    
}
// FO Locator
var FOLocatorRegionText = function (){
    if (GetLang()){sayText("To find your Field Officer Select region\n1) Central\n2) Nyanza\n3) Rift Valley\n4) Western\n#) My region is not listed")}
    else {sayText("Kupata afisa wa nyanjani, chagua Mkoa wako\n1) Central\n2) Nyanza\n3) Rift Valley\n4) Western\n#) Mkoa wangu hauko kwenye orodha")}
};
var LocationNotKnownText = function(){
        if (GetLang()){sayText("Sorry OAF does not work in your area")}
    else {sayText("Samahani, OAF haiko kwenye eneo lako")}
};
var FOLocatorCountyText = function(LocMenu){
    if (GetLang()){sayText("Which county are you in?\n"+LocMenu+"\n#) My county is not listed")}
    else {sayText("Chagua Kata yako\n"+LocMenu+"\n#) Kata yangu haiko kwenye orodha")}
};
var FOLocatorSubCountyText = function(LocMenu){
    if (GetLang()){sayText("Which sub county are you in?\n"+LocMenu+"\n#) My subcounty is not listed")}
    else {sayText("Chagua Kataa Ndogo yako\n"+LocMenu+"\n#) Kataa Ndogo yangu haiko kwenye orodha")}
};
var FOLocatorWardText = function(LocMenu){
    if (GetLang()){sayText("Which Ward are you in?\n"+LocMenu+"\na) Go to OAF Sites\n#) My ward is not listed")}
    else {sayText("Chagua Wadi yako\n"+LocMenu+"\na) Chagua OAF site\n#) Wadi yangu haiko kwenye orodha")}
};
var FOLocatorSiteText = function(LocMenu){
    if (GetLang()){sayText("Which ONE ACRE FUND site are you in?\n"+LocMenu+"\n#) My site is not listed")}
    else {sayText("Chagua site yako\n"+LocMenu+"\n#) Site yangu haiko kwenye orodha")}
};
var FOLocatorConfirmText = function(){
    if (GetLang()){sayText("Your field officer is "+ state.vars.FOName+ ".Do you want to reach out to the field officer\n1) Yes\n2) No - exit menu")}
    else {sayText("Ungependa kuwasiliana na Afisa wetu wa nyanjani?\n1) Yes\n2) No - exit menu")}
};
var FOLocatorConfirmDeclineText = function(){
    if (GetLang()){sayText("Thank you.")}
    else {sayText("Asante")}
};
var FOLocatorConfirmSuccessText = function(){
    if (GetLang()){sayText("One Acre Fund contact person details have been sent to you. If you have any questions call our toll free line at 080 0723355")}
    else {sayText("Utapokea ujumbe kutoka One Acre Fund ulio na jina na nambari ya simu ya agenti wetu. Piga simu ukiwa na swali lolote kwa 080 0723355")}
};
var FOLocatorFarmerSMS = function(){
    if (GetLang()){return state.vars.FOName+ " is your One Acre Fund contact person. Their number is "+state.vars.FOPN}
    else {return state.vars.FOName+" ndiye afisa wa nyanjani wa One Acre Fund. Nambari yake ya simu ni "+state.vars.FOPN}
};
var FOLocatorFOSMS = function(){
    return "Tafadahli wasiliana na "+contact.phone_number+ " ili ajiandikishe na One Acre Fund";
};
// INSURANCE
var InsuranceMenuText = function(){
    if (GetLang()){sayText("1) View NHIF Accredited Hospital\n9) Back to main")}
    else {sayText("1) Angalia Hospitali yako iliyoidhinishwa na NHIF\n9) Rudi mwanzo wa menu")}
}
var HospitalRegionText = function(){
    if (GetLang()){sayText("Please choose your region:\n1) Central\n2) Coast\n3) Eastern\n4) Nairobi\n5) North Eastern\n6) Nyanza\n7) Rift Valley\n8) Western")}
    else {sayText("Tafadhali chagua mkoa wako:\n1) Central\n2) Coast\n3) Eastern\n4) Nairobi\n5) North Eastern\n6) Nyanza\n7) Rift Valley\n8) Western")}
};

//Staff Menu
var StaffMenuText = function(){
    sayText("Staff Menu\n1) Report Unexpected Absence");
};
var StaffPayrollText = function(){
    sayText("Please enter you 5 digit payroll ID");
};
var StaffDaySelectText = function(){
    sayText("For which day are you reporting your first day of absense?\n1) Today\n2) Tomorrow\n3) Yesterday\n0) Cancel");
};
var StaffDayAmountText = function(){
    sayText("For how many days do you expect to be absent from work?\n1) 1 day\n2) 2 days\n3) 3 days\n4) 4 days or more\n0) Cancel");
};
var StaffConfrimAbsenceText = function(name){
    sayText("Thank you "+name+" for reporting your work absence. You will receive an email confirmation shortly with further instructions. We wish you well.");
};
var StaffCallForAbsenceText = function(name){
    sayText("For absences of more than 3 days, notify your manager directly or an HR representative through the Staff Support Line at 800 720 377. We wish you well.");
};

var StaffConfrimAbsenceEmail = function(email, firstname, startday, amount){
    var startdaydesc = "Today";
    if (startday == 2){startdaydesc = "Yesterday"}
    else if (startday == 3){startdaydesc = "Tomorrow"}
    var subject = "Absence request received"
    var body = "Hello "+firstname+"\n\nThank you for using our USSD Staff Menu to report your unexpected absence from work, beginning "+startdaydesc+" and expected to last "+amount+" days. Per HR policy, you must also alert your manager of your absence as soon as possible, and submit a Leave Form upon return to work.\n\nIf you have any questions or concerns about this or any other HR-related matter, please don't hesitate to call the OAF Staff Support Line at 0800 720 377.\n\nTogether in Service,\n\nKenya HR"
    sendEmail(email, subject, body);
};
var StaffConfrimAbsenceEmailHR = function(){
    console.log("Pending foprmat");
};

// Start logic flow
global.main = function () {
    LogSessionID();
    SplashMenuText();
    promptDigits("SplashMenu", {submitOnHash: true, maxDigits: 8, timeout: 5});
}
addInputHandler("SplashMenu", function(SplashMenu) {
    LogSessionID();
    InteractionCounter("SplashMenu");
    ClientAccNum = SplashMenu;
    if (SplashMenu == "99"){
        ChangeLang();
        SplashMenuText();
        promptDigits("SplashMenu", {submitOnHash: true, maxDigits: 8, timeout: 5});
    }
    else if (SplashMenu == "0"){
        FOLocatorRegionText();
        promptDigits("FOLocRegion", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else if (SplashMenu == "9"){
        StaffPayrollText();
        promptDigits('StaffPayRoll', {submitOnHash: true, maxDigits: 5, timeout: 5});
    }

    else {
        if (RosterClientVal(ClientAccNum)){
            console.log("SuccessFully Validated against Roster");
            client = RosterClientGet(ClientAccNum);
            state.vars.client = JSON.stringify(TrimClientJSON(client));
            call.vars.AccNum = ClientAccNum;
            MainMenuText (client);
            promptDigits("MainMenu", {submitOnHash: true, maxDigits: 8, timeout: 5});
        }
        else{
            console.log("account number not valid");
            SplashMenuFailure();
            promptDigits("SplashMenu", {submitOnHash: true, maxDigits: 8, timeout: 5});
        }
    }
});
addInputHandler("MainMenu", function(MainMenu) {
    LogSessionID();
    InteractionCounter("MainMenu");
    client = JSON.parse(state.vars.client);
    if (MainMenu== "99"){
        ChangeLang();
        MainMenuText (client);
        promptDigits("MainMenu", {submitOnHash: true, maxDigits: 8, timeout: 5});
    }
    else if (MainMenu == 1){
        client = JSON.parse(state.vars.client);
        PaymentMenuText (client.AccountNumber);
        promptDigits("PaymentAmount", {submitOnHash: true, maxDigits: 5, timeout: 5});
    }
    else if(MainMenu == 5 &&  IsPrePayTrialDistrict(client.DistrictName)){
        if(client.BalanceHistory[0].SeasonName == CurrentSeasonName){
            var paid = client.BalanceHistory[0].TotalRepayment_IncludingOverpayments;
            PrepaymentMenuText(GetPrepaymentAmount(client),paid);
        }
        else {
            PrepaymentNotEnrolledText();
        }
        promptDigits("BackToMain", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else if(MainMenu == 3 && IsGl(client.AccountNumber)&&IsJITTUDistrict(client.DistrictName)){
            if (SiteLockVal (client.SiteName, client.DistrictName)){
                JITTUSiteLockedText();
                promptDigits("ViewJITOrder", {submitOnHash: true, maxDigits: 8, timeout: 5});
            }
        else{
            JITTUAccNumText();
             promptDigits("JITTUAccNum", {submitOnHash: true, maxDigits: 8, timeout: 5});
        }
    }
    else if(MainMenu == 4 && IsGl(client.AccountNumber)&&IsJITEDistrict(client.DistrictName)){
        if (SiteLockVal (client.SiteName, client.DistrictName)){
            JITESiteLockedText();
            promptDigits("BackToMain", {submitOnHash: true, maxDigits: 8, timeout: 5});
        }
        else{
            JITEAccNumText();
            promptDigits("JITEAccNum", {submitOnHash: true, maxDigits: 8, timeout: 5});
        }
    }
    else if(MainMenu == 6 && FAWActive(client.DistrictName)&&EnrolledAndQualified(client)){
        var OrdersPlaced = FAWOrdersPlaced(client.AccountNumber);
        if (OrdersPlaced<FAWMaxOrders){
            var RemainOrders = FAWMaxOrders - OrdersPlaced;
            state.vars.FAWRemaining = RemainOrders;
            FAWOrderText(RemainOrders, OrdersPlaced);
            promptDigits("FAWOrder", {submitOnHash: true, maxDigits: 1, timeout: 5});
        }
        else {
            FAWMaxOrderText(OrdersPlaced);
            promptDigits("BackToMain", {submitOnHash: true, maxDigits: 1, timeout: 5});
        }
    }
    else if(MainMenu == 7 && SHSActive(client.DistrictName) ){
        SHSMenuText();
        promptDigits("SolarMenu", {submitOnHash: true, maxDigits: 2, timeout: 5});
    }
    else if(MainMenu == 8){
        InsuranceMenuText();
        promptDigits("InsuranceMenu", {submitOnHash: true, maxDigits: 1, timeout: 5})
    }
    else{
        var arrayLength = client.BalanceHistory.length;
        var Balance = '';
        var Season = "";
        var Overpaid = false;
        var Credit = "";
        var Paid = "";
        for (var i = 0; i < arrayLength; i++) {
            if (client.BalanceHistory[i].Balance>0){
                Season = client.BalanceHistory[i].SeasonName;
                Paid = client.BalanceHistory[i].TotalRepayment_IncludingOverpayments;
                Balance = client.BalanceHistory[i].Balance;
                Credit = client.BalanceHistory[i].TotalCredit;
            }
        }
        if (Balance === ''){
            for (var j = 0; j < arrayLength; j++) {
                if (client.BalanceHistory[j].TotalRepayment_IncludingOverpayments>0){
                    Paid = client.BalanceHistory[j].TotalRepayment_IncludingOverpayments;
                    Balance = client.BalanceHistory[j].Balance;
                    Credit = client.BalanceHistory[j].TotalCredit;
                    Season = client.BalanceHistory[j].SeasonName;
                    j = 99;
                    Overpaid = true;
                }
            }
        }
        CheckBalanceMenuText (Overpaid,Season,Credit,Paid,Balance);
        promptDigits("ContinueToPayment", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
});
addInputHandler("BackToMain", function(input) {
    LogSessionID();
    InteractionCounter("BackToMain");
    var client = JSON.parse(state.vars.client);
    MainMenuText (client);
    promptDigits("MainMenu", {submitOnHash: true, maxDigits: 2, timeout: 5});
});
addInputHandler("ContinueToPayment", function(ContinueToPayment) {
    LogSessionID();
    InteractionCounter("ContinueToPayment");
    client = JSON.parse(state.vars.client);
    PaymentMenuText (client.AccountNumber);
    promptDigits("PaymentAmount", {submitOnHash: true, maxDigits: 5, timeout: 5});
    
});
addInputHandler("PaymentAmount", function(PaymentAmount) {
    LogSessionID();
    InteractionCounter("PaymentAmount");
    if (PaymentAmount >= 10 && PaymentAmount < 70000){
        client = JSON.parse(state.vars.client);
        if (RosterColRequest (client.AccountNumber,PaymentAmount)){
            call.vars.ColStatus = "Success";
            PaymentSuccessText();
            call.vars.UpdateReceived = "NO";
            hangUp();
        }
        else {
            call.vars.ColStatus = "Failed";
            PaymentFailureText();
            ErrorEmail("KE USSD Collection request failure","Acc num: "+client.AccountNumber+"\nAmount: "+ PaymentAmount+ "\nPhonenumber: "+call.from_number);
            hangUp();
        }
    }
    else{
        PaymentRetryText();
        promptDigits("PaymentAmount", {submitOnHash: true, maxDigits: 5, timeout: 5});
    }
});
addInputHandler("FOLocRegion", function(Region) {
    LogSessionID();
    InteractionCounter("FOLocRegion");
    LocationNotKnown(Region);
    if (Region ==1 || Region == 2 || Region == 3 || Region == 4){
        var LocTable = project.getOrCreateDataTable("FO_Locator_Counties");
        CountyList = LocTable.queryRows({vars: {'regionid': Region}});
        var CountyArray = [];
        while (CountyList.hasNext()) {
            var CountyRow = CountyList.next();
            var Location = {
                "Name": CountyRow.vars.countyname,
                "ID": CountyRow.vars.countyid,
                "Menu": CountyRow.vars.countyid.substring(2)
            };
            CountyArray.push(Location);
        }
        CountyArray.sort(function(a, b){
            return a.Menu-b.Menu;
        });
        state.vars.LocArray = JSON.stringify(CountyArray);
        var LocMenu = "";
        for (var i = MenuCount; i < CountyArray.length; i++) {
            var MenuText =LocMenu + CountyArray[i].Menu+ ") "+ CountyArray[i].Name+'\n';
            if(MenuText.length < 65){LocMenu = MenuText}
            else{
                MenuCount = i;
                state.vars.MenuCount = i;
                state.vars.MenuNext = true;
                if (GetLang()){LocMenu= LocMenu+"N) Next"}
                else {LocMenu= LocMenu+"n) Ukurasa Ufwatao"}
                i = 9999;
            }
        }
        state.vars.LocMenu = LocMenu;
        FOLocatorCountyText(state.vars.LocMenu);
        promptDigits("FOLocCounty", {submitOnHash: true, maxDigits: 2, timeout: 5});
    }
    else{
        FOLocatorRegionText();
        promptDigits("FOLocRegion", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
});
addInputHandler("FOLocCounty", function(County) {
    LogSessionID();
    InteractionCounter("FOLocCounty");
    LocationNotKnown(County);
    var NextSelected = FOLocatorNextSelect(County);
    if (state.vars.MenuNext && NextSelected){
        var LocMenu = LocationNext();
        FOLocatorCountyText(LocMenu);
        promptDigits("FOLocCounty", {submitOnHash: true, maxDigits: 2, timeout: 5});
    }
    else {
        LocValid = false;
        CountyArray = JSON.parse(state.vars.LocArray);
        var CountyID = "";
        for (var i = 0; i < CountyArray.length; i++) {
            if (CountyArray[i].Menu == County) {
                LocValid = true;
                console.log("FoLocation Valid");
                CountyID = CountyArray[i].ID;
            }
        }
        if (LocValid){
            LocMenu = "" ;
            var LocTable = project.getOrCreateDataTable("FO_Locator_SubCounties");
            SubCountyList = LocTable.queryRows({vars: {'countyid': CountyID}});
            var SubCountyArray = []; 
            while (SubCountyList.hasNext()) {
                var SubCountyRow = SubCountyList.next();
                var Location = {
                    "Name": SubCountyRow.vars.subcountyname,
                    "ID": SubCountyRow.vars.subcountyid,
                    "Menu": SubCountyRow.vars.subcountyid.substring(CountyID.length+1)
                };
                SubCountyArray.push(Location); 
            }
            SubCountyArray.sort(function(a, b){return a.Menu-b.Menu});
            state.vars.LocArray = JSON.stringify(SubCountyArray);
            LocMenu = "";
            MenuCount = 0;
            MenuNext = false;
            for (var i = MenuCount; i < SubCountyArray.length; i++) {
                var MenuText = LocMenu + SubCountyArray[i].Menu+ ") "+ SubCountyArray[i].Name+'\n';
                if(MenuText.length < 65){LocMenu = MenuText}
                else{
                    MenuCount = i;
                    state.vars.MenuCount = i;
                    state.vars.MenuNext = true;
                    if (GetLang()){LocMenu = LocMenu+"N) Next"}
                    else {LocMenu= LocMenu+"n) Ukurasa Ufwatao"}
                    i = 9999;
                }
            }
            state.vars.LocMenu = LocMenu;
            FOLocatorSubCountyText(state.vars.LocMenu);
            promptDigits("FOLocSubCounty", {submitOnHash: true, maxDigits: 2, timeout: 5});
        }
        else {
            FOLocatorCountyText(state.vars.LocMenu);
            promptDigits("FOLocCounty", {submitOnHash: true, maxDigits: 2, timeout: 5});
        }
    }
});
addInputHandler("FOLocSubCounty", function(SubCounty) {
    LogSessionID();
    InteractionCounter("FOLocSubCounty");
    LocationNotKnown(SubCounty);
    var NextSelected = FOLocatorNextSelect(SubCounty);
    if (state.vars.MenuNext &&  NextSelected){
        var LocMenu = LocationNext();
        FOLocatorSubCountyText(LocMenu);
        promptDigits("FOLocSubCounty", {submitOnHash: true, maxDigits: 2, timeout: 5});
    }
    else {
        LocValid = false;
        SubCountyArray = JSON.parse(state.vars.LocArray);
        var SubCountyID = "";
        for (var i = 0; i < SubCountyArray.length; i++) {
            if (SubCountyArray[i].Menu == SubCounty) {
                LocValid = true;
                SubCountyID = SubCountyArray[i].ID;
                state.vars.SubCountyID = SubCountyArray[i].ID;
            }
        }
        if (LocValid){
            LocMenu = "";
            var LocTable = project.getOrCreateDataTable("FO_Locator_Wards");
            WardList = LocTable.queryRows({vars: {'subcountyid': SubCountyID}});
            var WardArray = []; 
            while (WardList.hasNext()) {
                var WardRow = WardList.next();
                var Location = {
                    "Menu": WardRow.vars.wardid.substring(SubCountyID.length+1),
                    "Name": WardRow.vars.wardname,
                    "ID": WardRow.vars.wardid
                };
                WardArray.push(Location); 
            }
            WardArray.sort(function(a, b){return a.Menu-b.Menu;});
            state.vars.LocArray = JSON.stringify(WardArray);
            LocMenu = "";
            MenuCount = 0;
            MenuNext = false;
            for (var i = MenuCount; i < WardArray.length; i++) {
                var MenuText =LocMenu + WardArray[i].Menu+ ") " + WardArray[i].Name+'\n';
                if(MenuText.length < 65){LocMenu = MenuText}
                else{
                    MenuCount = i;
                    state.vars.MenuCount = i;
                    state.vars.MenuNext = true;
                    if (GetLang()){LocMenu= LocMenu+"N) Next"}
                    else {LocMenu = LocMenu+"n) Ukurasa Ufwatao"}
                    i = 9999;
                }
            }
            state.vars.LocMenu = LocMenu;
            FOLocatorWardText(state.vars.LocMenu);
            promptDigits("FOLocWard", {submitOnHash: true, maxDigits: 2, timeout: 5});
        }
        else {
            FOLocatorSubCountyText(state.vars.LocMenu);
            promptDigits("FOLocSubCounty", {submitOnHash: true, maxDigits: 2, timeout: 5});            
        }
    }
});
addInputHandler("FOLocWard", function(Ward) {
    LogSessionID();
    InteractionCounter("FOLocWard");
    LocationNotKnown(Ward);
        var LocValid = false;
    var NextSelected = FOLocatorNextSelect(Ward);
    if (state.vars.MenuNext && NextSelected){
        var LocMenu = LocationNext();
        FOLocatorWardText(LocMenu);
        promptDigits("FOLocWard", {submitOnHash: true, maxDigits: 2, timeout: 5});
    }
    else {
        WardArray = JSON.parse(state.vars.LocArray);
        var LocID = "";
        for (var i = 0; i < WardArray.length; i++) {
            if (WardArray[i].Menu == Ward) {
                LocValid = true;
                LocID = WardArray[i].ID;
            }
        }
        if (LocValid || Ward.toLowerCase() == "a"|| Ward =="*"){
            LocMenu = "";
            var LocTable = project.getOrCreateDataTable("FO_Locator_Sites");
            if (Ward.toLowerCase() == "a"|| Ward =="*"){
                LocId = state.vars.SubCountyID;
                SiteList = LocTable.queryRows({vars: {'subcountyid':state.vars.SubCountyID}});
            }
            else{SiteList = LocTable.queryRows({vars: {'wardid': LocID}})}
            var SiteArray = []; 
            while (SiteList.hasNext()) {
                var SiteRow = SiteList.next();
                var menu = "";
                if (Ward.toLowerCase() == "a"|| Ward =="*"){menu =SiteRow.vars.siteid.substring(SiteRow.vars.subcountyid.length+1).replace(".", "")}
                else{menu =SiteRow.vars.siteid.substring(SiteRow.vars.wardid.length+1)}
                var Location = {
                    "Menu": menu,
                    "Name": SiteRow.vars.sitename,
                    "ID": SiteRow.vars.siteid,
                    "FOPN": SiteRow.vars.fophonenumber,
                    "FOName":  SiteRow.vars.foname
                };
                SiteArray.push(Location); 
            }
            SiteArray.sort(function(a, b){return a.Menu-b.Menu});
            state.vars.LocArray = JSON.stringify(SiteArray);
            LocMenu = "";
            MenuCount = 0;
            MenuNext = false;
            for (var i = MenuCount; i < SiteArray.length; i++) {
                var MenuText =LocMenu + SiteArray[i].Menu+ ") " + SiteArray[i].Name+'\n';
                if(MenuText.length < 65){LocMenu = MenuText}
                else{
                    MenuCount = i;
                    state.vars.MenuCount = i;
                    state.vars.MenuNext = true;
                    if (GetLang()){LocMenu = LocMenu+"N) Next"}
                    else {LocMenu= LocMenu+"n) Ukurasa Ufwatao"}
                    i = 9999;
                }
            }
            state.vars.LocMenu = LocMenu;
            FOLocatorSiteText(state.vars.LocMenu);
            promptDigits("FOLocSite", {submitOnHash: true, maxDigits: 2, timeout: 5});
        }
        else{
            FOLocatorWardText(state.vars.LocMenu);
            promptDigits("FOLocWard", {submitOnHash: true, maxDigits: 2, timeout: 5});
        }
    }
});
addInputHandler("FOLocSite", function(Site) {
    LogSessionID();
    InteractionCounter("FOLocSite");
    var LocValid = false;
    LocationNotKnown(Site);
    var NextSelected = FOLocatorNextSelect(Site);
    if (state.vars.MenuNext && NextSelected){
        var LocMenu = LocationNext();
        FOLocatorSiteText(LocMenu);
        promptDigits("FOLocSite", {submitOnHash: true, maxDigits: 2, timeout: 5});
    }
    else {
        SiteArray = JSON.parse(state.vars.LocArray);
        for (var i = 0; i < SiteArray.length; i++) {
            if (SiteArray[i].Menu == Site) {
                LocValid = true;
                state.vars.FOPN = SiteArray[i].FOPN;
                state.vars.FOName = SiteArray[i].FOName;
                state.vars.SiteName = SiteArray[i].Name;
                state.vars.FOLocatorSiteName = SiteArray[i].Name;
            }
        }
        if (LocValid){
             FOLocatorConfirmText();
             promptDigits("FOLocConfrim", {submitOnHash: true, maxDigits: 2, timeout: 5});
        }
        else {
            FOLocatorSiteText(state.vars.LocMenu);
            promptDigits("FOLocSite", {submitOnHash: true, maxDigits: 2, timeout: 5});
        }
    }
});
addInputHandler("FOLocConfrim", function(Confirm) {
    LogSessionID();
    InteractionCounter("FOLocConfrim");
    if (Confirm == "1"){
        var FOLocatorLabel = project.getOrCreateLabel("FO Locator");
        var FarmerSMSContent = FOLocatorFarmerSMS();
        var FOSMSContent = FOLocatorFOSMS();
        var sent_msg_farmer = project.sendMessage({
            content:  FarmerSMSContent,
            to_number: contact.phone_number,
            route_id: RouteIDPush,
            label_ids : [FOLocatorLabel.id]
        });
        var sent_msg_fo = project.sendMessage({
            content:  FOSMSContent,
            to_number:state.vars.FOPN ,
            route_id: RouteIDPush,
            label_ids : [FOLocatorLabel.id]
        });
        var ProspectTable = project.getOrCreateDataTable("FO_Locator_Prospects");
        var ProspectRow = ProspectTable.createRow({
            vars: {
                ProspectPN:contact.phone_number,
                SiteName: state.vars.FOLocatorSiteName,
                FOName: state.vars.FOName,
                FOPhoneNumber: state.vars.FOPN 
            }
        });
        ProspectRow.save();
        FOLocatorConfirmSuccessText();
        hangUp();
    }
    else{
        FOLocatorConfirmDeclineText();
        hangUp();
    }
});
addInputHandler("JITTUAccNum", function(JITTUAccNum) {
    LogSessionID();
    InteractionCounter("JITTUAccNum");
    var JITEOrder = JITECheckPreviousAccNum(JITTUAccNum)
    if (JITTUAccNum == "1"){
        var client = JSON.parse(state.vars.client);
        MainMenuText (client);
        promptDigits("MainMenu", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else if(JITEOrder){
        JITTU_JITEClientText();
        promptDigits("BackToMain", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else{
        if(RosterClientVal(JITTUAccNum)){
            JIT_client = RosterClientGet(JITTUAccNum);
            state.vars.JIT_client = JSON.stringify(TrimClientJSON(JIT_client));
            client = JSON.parse(state.vars.client);
            if (client.GroupId == JIT_client.GroupId){
                var FarmerSeason = JIT_client.BalanceHistory[0].SeasonName;
                if (FarmerSeason == CurrentSeasonName){
                    var PrepaymentNeeded = GetPrepaymentAmount(JIT_client);
                    var Paid = JIT_client.BalanceHistory[0].TotalRepayment_IncludingOverpayments;
                    if (Paid  >= PrepaymentNeeded){
                        JITTUOrderOverview(JIT_client);
                    }
                    else{
                        JITTUPrepaymentNotValidText (Paid,PrepaymentNeeded)
                        hangUp();
                    }
                }
                else{
                    JITTUNotEnrolled();
                    promptDigits("JITTUAccNum", {submitOnHash: true, maxDigits: 1, timeout: 5});
                }
            }
            else {
                JITTUAccNumNotValidText();
                promptDigits("JITTUAccNum", {submitOnHash: true, maxDigits: 8, timeout: 5});
            }
        }
        else {
            JITTUAccNumNotValidText();
            promptDigits("JITTUAccNum", {submitOnHash: true, maxDigits: 8, timeout: 5});
        }
    }
});
addInputHandler("JITTUBundleSelect", function(BundleSelect){
    LogSessionID();
    InteractionCounter("JITTUBundleSelect");
    if (BundleSelect =="9"){
        var client = JSON.parse(state.vars.client);
        MainMenuText (client);
        promptDigits("MainMenu", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else{
        var bundleoptions = JSON.parse(state.vars.JITTUOrdersAvailable);
        var ValidOption = false
        for (var i = 0; i < bundleoptions.length; i++) {
            var MenuNumber = i+1;
            if(BundleSelect == MenuNumber){
                JIT_client = JSON.parse(state.vars.JIT_client);
                ValidOption = true;
                state.vars.bundleselect = JSON.stringify(bundleoptions[i]);
                if (bundleoptions[i].variety== true){
                    var warehousename = JITgetWarehouse(JIT_client.DistrictName)
                    var varieties = JITGetVarieties(warehousename);
                    JITTUVarietySelectText(varieties);
                    promptDigits("JITTUVarietySelect", {submitOnHash: true, maxDigits: 1, timeout: 5});
                }
                else{
                    JITTUOrderNoVarConfrimText(bundleoptions[i].bundlename)
                    promptDigits("JITTUConfirm", {submitOnHash: true, maxDigits: 1, timeout: 5});
                }
            }
        }
        if(ValidOption === false){
            JITBundleSelectText(bundleoptions);
            promptDigits("JITTUBundleSelect", {submitOnHash: true, maxDigits: 1, timeout: 5});
        }
    }
});
addInputHandler("JITTUVarietySelect", function(VarietySelected) {
    LogSessionID();
    InteractionCounter("JITTUVarietySelect");
    if (VarietySelected == "9"){
        var client = JSON.parse(state.vars.client);
        MainMenuText (client);
        promptDigits("MainMenu", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else{
        var valid = false;
        var variety = "";
        var varieties = JSON.parse(state.vars.varieties);
        for (var i = 0; i < varieties.length; i++) {
            var menu = i+1;
            if (VarietySelected == menu){
                valid = true;
                variety = varieties[i];
                state.vars.variety = varieties[i];
            }
        }
        if (valid){
            var bundleselected = JSON.parse(state.vars.bundleselect);
            JITTUOrderConfrimText(bundleselected.bundlename,variety)
            promptDigits("JITTUConfirm", {submitOnHash: true, maxDigits: 1, timeout: 5});
        }
        else {
            JIT_client = JSON.parse(state.vars.JIT_client);
            var warehousename = JITgetWarehouse(JIT_client.DistrictName)
            var varieties = JITGetVarieties(warehousename);
            JITTUVarietySelectText(varieties);
            promptDigits("JITTUVarietySelect", {submitOnHash: true, maxDigits: 1, timeout: 5});
        }
    }
});
addInputHandler("JITTUConfirm", function(Confirm){
    LogSessionID();
    InteractionCounter("JITTUConfirm");
    var bundleSelected = JSON.parse(state.vars.bundleselect)
    if (Confirm == "9"){
        var client = JSON.parse(state.vars.client);
        MainMenuText (client);
        promptDigits("MainMenu", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else if(Confirm == "1"){
            JIT_client = JSON.parse(state.vars.JIT_client);
            var warehousename = JITgetWarehouse(JIT_client.DistrictName)
            JITTUCreateOrder(JIT_client,bundleSelected, state.vars.variety);
            JITUpdateWarehouse(warehousename,bundleSelected.bundlename, state.vars.variety);
            JITTUOrderOverview (JIT_client);
        }
    else {
        JITTUOrderNoVarConfrimText(bundleSelected.bundlename);
        promptDigits("JITTUConfirm", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
});
addInputHandler("ContinueToJITTUBundleSelect", function(Continue) {
    LogSessionID();
    InteractionCounter("ContinueToJITTUBundleSelect");
    if(Continue =="2") {
        JIT_client = JSON.parse(state.vars.JIT_client);
        var orderoverview = JITTURetrieveOrders(JIT_client.AccountNumber);
        JITTUOrderOverviewSMS(orderoverview, JIT_client.AccountNumber, contact.phone_number);
        JITTUOrderedText();
        hangUp();
    }
    else{
        console.log(state.vars.JIT_client);
        var JIT_client = JSON.parse(state.vars.JIT_client)
        var BundleOptions = JITTUGetOrderOptions(JIT_client);
        JITBundleSelectText(BundleOptions);
        promptDigits("JITTUBundleSelect", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
});
addInputHandler("ViewJITOrder", function(JITTU_accNum) {
    LogSessionID();
    InteractionCounter("ViewJITOrder");
    if (JITTU_accNum == "1"){
        var client = JSON.parse(state.vars.client);
        MainMenuText (client);
        promptDigits("MainMenu", {submitOnHash: true, maxDigits: 8, timeout: 5});
    }
    else{
        var JITTUOrders = RetrieveJITTUOrders(JITTU_accNum);
        console.log("Order overview: "+JSON.stringify(JITTUOrders));
        JITTUShowOrdersText(JITTUOrders);
        promptDigits("BackToMain", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
});
addInputHandler("JITEAccNum", function(JITE_AccNum){
    LogSessionID();
    InteractionCounter("JITEAccNum");
    if (JITE_AccNum == "0"){
        JITEFirstNameText();
        promptDigits("JITEFirstName", {submitOnHash: true, maxDigits: 10, timeout: 5});
    }
    else{
        var alreadyOrdered = JITECheckPreviousAccNum(JITE_AccNum);
        if (alreadyOrdered) {
            JITEAlreadyOrderedText();
            promptDigits("BackToMain", {submitOnHash: true, maxDigits: 1, timeout: 5});
        }
        else {
            if (RosterClientVal(JITE_AccNum)){
                console.log("SuccessFully Validated against Roster");
                JITE_client = RosterClientGet(JITE_AccNum);
                client = JSON.parse(state.vars.client);
                var NotBanned = true
                if (GetBalance(JITE_client, LastSeason)>0){NotBanned = false}
                if (client.DistrictId == JITE_client.DistrictId && NotBanned){
                    if (JITE_client.BalanceHistory[0].SeasonName != CurrentSeasonName){
                        state.vars.JITE_client = JSON.stringify(TrimClientJSON(JITE_client));
                        var JITEOrderOptions = JITEGetOrderOptions()
                        JITEBundleSelectText(JITEOrderOptions);
                        promptDigits("JITEBundleSelect", {submitOnHash: true, maxDigits: 1, timeout: 5});
                    }
                    else{
                        JITEAccNumAlreadyEnrolledText();
                        promptDigits("BackToMain", {submitOnHash: true, maxDigits: 1, timeout: 5});
                    }
                }
                else {
                    JITEAccNumNotValidText();
                    promptDigits("JITEAccNum", {submitOnHash: true, maxDigits: 8, timeout: 5});
                }
            }
            else {
                JITEAccNumNotValidText();
                promptDigits("JITEAccNum", {submitOnHash: true, maxDigits: 8, timeout: 5});
            }
        }
    }
});
addInputHandler("JITEFirstName", function(JITE_FirstName){
    LogSessionID();
    InteractionCounter("JITEFirstName");
    JITELastNameText();
    promptDigits("JITESecondName", {submitOnHash: true, maxDigits: 10, timeout: 5});
});
addInputHandler("JITESecondName", function(JITE_SecondName){
    LogSessionID();
    InteractionCounter("JITESecondName");
    JITENationalIDText();
    promptDigits("JITENationalID", {submitOnHash: true, maxDigits: 10, timeout: 5});
});
addInputHandler("JITENationalID", function(JITE_NationalID){
    LogSessionID();
    InteractionCounter("JITENationalID");
    if (ValNationalID(JITE_NationalID)){
        var alreadyOrdered = JITECheckPreviousNationalID(JITE_NationalID);
        if (alreadyOrdered) {
            JITEAlreadyOrderedText();
            promptDigits("BackToMain", {submitOnHash: true, maxDigits: 1, timeout: 5});
        }
        else {
            var JITEOrderOptions = JITEGetOrderOptions()
            JITEBundleSelectText(JITEOrderOptions);
            promptDigits("JITEBundleSelect", {submitOnHash: true, maxDigits: 1, timeout: 5});
        }
    }
    else {
        JITENationalInvalidText();
        promptDigits("JITENationalID", {submitOnHash: true, maxDigits: 10, timeout: 5});
    }
});
addInputHandler("JITEBundleSelect", function(JITE_BundleSelect){
    LogSessionID();
    InteractionCounter("JITEBundleSelect");
    if (JITE_BundleSelect =="9"){
        var client = JSON.parse(state.vars.client);
        MainMenuText (client);
        promptDigits("MainMenu", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else{
        client = JSON.parse(state.vars.client);
        var bundleoptions = JSON.parse(state.vars.JITEOrdersAvailable);
        var ValidOption = false
        for (var i = 0; i < bundleoptions.length; i++) {
            var MenuNumber = i+1;
            if(JITE_BundleSelect == MenuNumber){
                ValidOption = true;
                if (bundleoptions[i].variety== true){
                    var warehousename = JITgetWarehouse(client.DistrictName)
                    var varieties = JITGetVarieties(warehousename);
                    JITTUVarietySelectText(varieties);
                    state.vars.JITEbundleselect = JSON.stringify(bundleoptions[i]);
                    promptDigits("JITEVarietySelect", {submitOnHash: true, maxDigits: 1, timeout: 5});
                }
                else{console.log("no varieties back up")}
            }
        }
        if(ValidOption === false){
            JITEBundleSelectText(bundleoptions);
            promptDigits("JITEBundleSelect", {submitOnHash: true, maxDigits: 1, timeout: 5});
        }
    }
});
addInputHandler("JITEVarietySelect", function(JITE_VarSelect){
    LogSessionID();
    InteractionCounter("JITEVarietySelect");
    if (JITE_VarSelect == "9"){
        var client = JSON.parse(state.vars.client);
        MainMenuText (client);
        promptDigits("MainMenu", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else{
        var valid = false;
        var variety = "";
        var varieties = JSON.parse(state.vars.varieties);
        for (var i = 0; i < varieties.length; i++) {
            var menu = i+1;
            if (JITE_VarSelect == menu){
                valid = true;
                variety = varieties[i];
            }
        }
        if (valid){
            state.vars.variety = variety;
            var bundleselected = JSON.parse(state.vars.JITEbundleselect);
            JITEOrderConfrimText(bundleselected.bundlename,variety)
            promptDigits("JITEConfirm", {submitOnHash: true, maxDigits: 10, timeout: 5});
        }
        else {
            varieties = JSON.parse(state.vars.varieties);
            JITTUVarietySelectText(varieties);
            promptDigits("JITEVarietySelect", {submitOnHash: true, maxDigits: 1, timeout: 5});
        }
    }
});
addInputHandler("JITEConfirm", function(Confirm){
    LogSessionID();
    InteractionCounter("JITEConfirm");
    if (Confirm == "9"){
        var client = JSON.parse(state.vars.client);
        MainMenuText (client);
        promptDigits("MainMenu", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else{
        var Phonenumber = Confirm;
        var ValidPhone =  ValidPN(Phonenumber);
        if (ValidPhone){
            variety = state.vars.variety
            var bundleselected = JSON.parse(state.vars.JITEbundleselect);
            var GLclient = JSON.parse(state.vars.client);
            var warehousename = JITgetWarehouse(GLclient.DistrictName);
            JITECreateOrder(call.vars.JITEAccNum,call.vars.JITEFirstName, call.vars.JITESecondName, call.vars.JITENationalID, GLclient,bundleselected,variety,  warehousename,Phonenumber);
            JITEOrdeCloseText();
            JITEOrderConfrimSMS(Phonenumber, bundleselected.bundlename,variety)
            JITEOrderConfrimSMS(contact.phone_number, bundleselected.bundlename,variety)
            hangUp();
        }
        else {
            variety = state.vars.variety
            var bundleselected = JSON.parse(state.vars.JITEbundleselect);
            JITEOrderConfrimText(bundleselected.bundlename,variety)
            promptDigits("JITEConfirm", {submitOnHash: true, maxDigits: 10, timeout: 5});
        }
    }
});
addInputHandler("FAWOrder", function(Order){
    LogSessionID();
    InteractionCounter("FAWOrder");
    var client = JSON.parse(state.vars.client);
    if (Order =="9"){
        MainMenuText (client);
        promptDigits("MainMenu", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else{
        if (isNaN(Order)){
            FAWOrderText(state.vars.FAWRemaining);
            promptDigits("FAWOrder", {submitOnHash: true, maxDigits: 1, timeout: 5});
        }
        else if (parseInt(Order)<=  parseInt(state.vars.FAWRemaining)){
            state.vars.FAWOrder = Order
            client = JSON.parse(state.vars.client);
            FAWConfirmText(Order);
            promptDigits("FAWConfirm", {submitOnHash: true, maxDigits: 1, timeout: 5});
        }
        else {
            FAWOrderText(state.vars.FAWRemaining);
            promptDigits("FAWOrder", {submitOnHash: true, maxDigits: 1, timeout: 5});
        }
    }
});
addInputHandler("FAWConfirm", function(confirm){
    LogSessionID();
    InteractionCounter("FAWConfirm");
    var client = JSON.parse(state.vars.client);
    if (confirm == "1"){
            FAWCreateOrder (client, state.vars.FAWOrder)
            FAWSuccessText(state.vars.FAWOrder);
            FAWSuccessSMS(state.vars.FAWOrder);
            promptDigits("BackToMain", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else if (confirm == "9"){
        MainMenuText (client);
        promptDigits("MainMenu", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
});
addInputHandler("SolarMenu", function(Menu){
    LogSessionID();
    InteractionCounter("SolarMenu");
    var client = JSON.parse(state.vars.client);
    if (Menu =="9"){
        MainMenuText (client);
        promptDigits("MainMenu", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else if (Menu =="1"){
        if (EnrolledAndQualified(client)){
            if (SHSValidateReg(client, CurrentSeasonName)){
                SHSSerialText();
                promptDigits("SerialRegister", {submitOnHash: true, maxDigits: 10, timeout: 5});
            }
            else {
                SHSRegNoOrderText();
                promptDigits("ReportIssueOrBackToMain", {submitOnHash: true, maxDigits: 1, timeout: 5});
            }
        }
        else{
            SHSNotQualifiedText();
            promptDigits("ReportIssueOrBackToMain", {submitOnHash: true, maxDigits: 1, timeout: 5});
        }
    }
    else if (Menu =="2"){
        var SerialList = GetSerialForClient(client.AccountNumber);
        if (SerialList.length == 1){
            var SHSDetail = GetSHSDetails(client.AccountNumber, SerialList[0].SerialNumber);
            var arrayLength = client.BalanceHistory.length;
            for (var i = 0; i < arrayLength; i++) {
                if (client.BalanceHistory[i].SeasonName == SHSDetail.season){
                    if (client.BalanceHistory[i].Balance>0 && client.DistrictName != StaffDistrict){
                        LoanNotRepaidText(client.BalanceHistory[i].SeasonName)
                        promptDigits("BackToMain", {submitOnHash: true, maxDigits: 1, timeout: 5});
                    }
                    else {
                        state.vars.SHSCode = SHSDetail.UnlockCode;
                        SHSUnlockText(SHSDetail.UnlockCode, SHSDetail.season);
                        promptDigits("SHSCodeContinue", {submitOnHash: true, maxDigits: 1, timeout: 5});
                    }
                }
            }
        }
        else{    
            SHSSerialText();
            promptDigits("SerialCode", {submitOnHash: true, maxDigits: 10, timeout: 5});
        }
    }
    else if(Menu =="99"){
        CallMeBackText();
        state.vars.issuetype = "SHS";
        promptDigits("CallBackPN", {submitOnHash: true, maxDigits: 10, timeout: 5});
    }
});
addInputHandler("SerialRegister", function(Serial){
    LogSessionID();
    InteractionCounter("SerialRegister");
    var client = JSON.parse(state.vars.client);
    if (Serial =="9"){
        MainMenuText (client);
        promptDigits("MainMenu", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else if (Serial =="99"){
        CallMeBackText();
        state.vars.issuetype = "SHS";
        promptDigits("CallBackPN", {submitOnHash: true, maxDigits: 10, timeout: 5});
    }
    else {
        var Status = SHSValidateSerial (client.AccountNumber,Serial, state.vars.SHS_Type);
        if(Status == "RegAccNum"){
            SHSShowCode(client,Serial,state.vars.SHS_Type);
        }
        else if (SHSRegThisSeason(client.AccountNumber)){
            SHSSerialNotValidText();
            promptDigits("SerialRegister", {submitOnHash: true, maxDigits: 10, timeout: 5});
        }
        else {
            if(Status == "NotReg"){
                SHSRegSerial(client,Serial,state.vars.SHS_Type);
                SHSShowCode(client,Serial,state.vars.SHS_Type);
            }
            else if(Status == "RegOther"){
                SHSRegOtherText();
                promptDigits("SerialRegister", {submitOnHash: true, maxDigits: 10, timeout: 5});
            }
            else {
                SHSSerialNotValidText();
                promptDigits("SerialRegister", {submitOnHash: true, maxDigits: 10, timeout: 5});
            }
        }
    }
});
addInputHandler("SerialCode", function(Serial){
    LogSessionID();
    InteractionCounter("SerialCode");
    var client = JSON.parse(state.vars.client);
    if (Serial =="9"){
        MainMenuText (client);
        promptDigits("MainMenu", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else if (Serial =="99"){
        CallMeBackText();
        state.vars.issuetype = "SHS";
        promptDigits("CallBackPN", {submitOnHash: true, maxDigits: 10, timeout: 5});
    }
    if (SHSShowCode(client,Serial) === false){
        SHSSerialNotValidText();
        promptDigits("SerialCode", {submitOnHash: true, maxDigits: 10, timeout: 5});
    }
});
addInputHandler("SHSCodeContinue", function(Input){
    LogSessionID();
    InteractionCounter("SHSCodeContinue");
    var client = JSON.parse(state.vars.client);
    MainMenuText (client);
    promptDigits("MainMenu", {submitOnHash: true, maxDigits: 1, timeout: 5});
});
addInputHandler("ReportIssueOrBackToMain", function(Input){
    LogSessionID();
    InteractionCounter("ReportIssueOrBackToMain");
    state.vars.issuetype = "SHS";
    var client = JSON.parse(state.vars.client);
    if (Input =="99"){
        CallMeBackText();
        promptDigits("CallBackPN", {submitOnHash: true, maxDigits: 10, timeout: 5});
    }
    else{
        MainMenuText (client);
        promptDigits("MainMenu", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
});
addInputHandler("CallBackPN", function(Input){
    LogSessionID();
    InteractionCounter("CallBackPN");
    var client = JSON.parse(state.vars.client);
    if (Input =="9"){
        MainMenuText (client);
        promptDigits("MainMenu", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else if (Input =="1"){
        CallBackCreate(client,contact.phone_number,state.vars.issuetype);
        CallMeBackConfirmText();
        promptDigits("BackToMain", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else {
        CallBackCreate(client,Input,state.vars.issuetype);
        CallMeBackConfirmText();
        promptDigits("BackToMain", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
});
addInputHandler('InsuranceMenu', function(input) {
    LogSessionID();
    InteractionCounter('InsuranceMenu');
    var client = JSON.parse(state.vars.client);
    if (input =="9"){
        MainMenuText (client);
        promptDigits("MainMenu", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else {
        HospitalRegionText();
        promptDigits("HospitalRegion", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
});
addInputHandler('HospitalRegion', function(input) {
    LogSessionID();
    InteractionCounter('HospitalRegion');
    if(input == 1 ||input == 2 || input == 3 || input == 4 ||input == 5 || input == 6 || input == 7 || input == 8){
        state.vars.LocMenuText = HospitalTownsRetrieve(input);
        sayText(state.vars.LocMenuText);
        promptDigits("HospitalTown", {submitOnHash: true, maxDigits: 2, timeout: 5});
    }
    else {
        HospitalRegionText();
        promptDigits("HospitalRegion", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
});
addInputHandler('HospitalTown', function(input) {
    LogSessionID();
    InteractionCounter('HospitalTown');
    if (state.vars.MenuNext && input == "0"){
        state.vars.LocMenuText = LocationNext();
        sayText(state.vars.LocMenuText);
        promptDigits("HospitalTown", {submitOnHash: true, maxDigits: 2, timeout: 5});
    }
    else if (ValidateHostitalInput(input)){
        state.vars.LocMenuText = HospitalsRetrieve(state.vars.locID);
        sayText(state.vars.LocMenuText);
        promptDigits("Hospital", {submitOnHash: true, maxDigits: 2, timeout: 5});
    }
    else{
        sayText(state.vars.LocMenuText);
        promptDigits("HospitalTown", {submitOnHash: true, maxDigits: 2, timeout: 5});
    }
});
addInputHandler('Hospital', function(input) {
    LogSessionID();
    InteractionCounter('Hospital');
    console.log(state.vars.LocMenuText);
    if (state.vars.MenuNext && input == 0){
        state.vars.LocMenuText = LocationNext();
        sayText(state.vars.LocMenuText);
        promptDigits("Hospital", {submitOnHash: true, maxDigits: 2, timeout: 5});
    }
    else{
        sayText(state.vars.LocMenuText);
        promptDigits("Hospital", {submitOnHash: true, maxDigits: 2, timeout: 5});
    }
});
addInputHandler('StaffPayRoll', function(input) {
    LogSessionID();
    InteractionCounter('StaffPayRoll');
    if (ValidPayRollID(input)){
        state.vars.payrollid = input;
        StaffMenuText();
        promptDigits("StaffMenu", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else{
        StaffPayrollText();
        promptDigits("StaffPayRoll", {submitOnHash: true, maxDigits: 5, timeout: 5});
    }
});


addInputHandler('StaffMenu', function(input) {
    LogSessionID();
    InteractionCounter('StaffMenu');
    if (input == 1){
        StaffDaySelectText();
        promptDigits("DaySelect", {submitOnHash: true, maxDigits: 1, timeout: 5});
    }
    else{
        StaffMenuText();
        promptDigits("StaffMenu", {submitOnHash: true, maxDigits: 1, timeout: 5}); 
    }
    
});

addInputHandler('DaySelect', function(input) {
    LogSessionID();
    InteractionCounter('DaySelect');
    if (input == 1 || input == 2 || input ==3){
        StaffDayAmountText();
        promptDigits("DayAmount", {submitOnHash: true, maxDigits: 2, timeout: 5});
    }
    else if (input == 0 ){
        sayText("Thank you");
        hangUp();
    }
    else{
        StaffDaySelectText();
        promptDigits("DaySelect", {submitOnHash: true, maxDigits: 2, timeout: 5});
    }
});

addInputHandler('DayAmount', function(input) {
    LogSessionID();
    InteractionCounter('DayAmount');
    if (input == 1 || input == 2 || input ==3){
        var amount = input;
        var StaffDetail = GetStaffDetails(state.vars.payrollid);
        StaffCreateRequest (StaffDetail.payrollid, call.vars.DaySelect,amount);
        StaffConfrimAbsenceText(StaffDetail.name);
        StaffConfrimAbsenceEmail(StaffDetail.email, StaffDetail.name, call.vars.DaySelect, amount)
        // place holder for email to HR
    }
    else if (input == 4){
        StaffCallForAbsenceText();
        hangUp();
    }
    else if (input == 0 ){
        sayText("Thank you");
        hangUp();
    }
    else {
        StaffDayAmountText();
        promptDigits("DayAmount", {submitOnHash: true, maxDigits: 2, timeout: 5});
    }
});

