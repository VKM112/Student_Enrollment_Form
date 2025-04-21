const DB_API_URL = "http://api.login2explore.com:5577";
        const API_ENDPOINT = "/api/iml";
        const CONN_TOKEN = "90934773|-31949209158771117|90955951";
        const DB_NAME = "SCHOOL-DB";
        const REL_NAME = "STUDENT-TABLE";

        $(document).ready(function() {
            resetForm();
            $("#rollNo").focus();
        });

        function validateAndGetFormData() {
            var rollNoVar = $("#rollNo").val().trim();
            if (rollNoVar === "") {
                alert("Roll No is Required");
                $("#rollNo").focus();
                return "";
            }

            var fullNameVar = $("#fullName").val().trim();
            if (fullNameVar === "") {
                alert("Full Name is Required");
                $("#fullName").focus();
                return "";
            }

            var classVar = $("#class").val().trim();
            if (classVar === "") {
                alert("Class is Required");
                $("#class").focus();
                return "";
            }

            var birthDateVar = $("#birthDate").val();
            if (birthDateVar === "") {
                alert("Birth Date is Required");
                $("#birthDate").focus();
                return "";
            }

            var addressVar = $("#address").val().trim();
            if (addressVar === "") {
                alert("Address is Required");
                $("#address").focus();
                return "";
            }

            var enrollmentDateVar = $("#enrollmentDate").val();
            if (enrollmentDateVar === "") {
                alert("Enrollment Date is Required");
                $("#enrollmentDate").focus();
                return "";
            }

            var jsonStrObj = {
                rollNo: rollNoVar,
                fullName: fullNameVar,
                class: classVar,
                birthDate: birthDateVar,
                address: addressVar,
                enrollmentDate: enrollmentDateVar
            };

            return JSON.stringify(jsonStrObj);
        }

        function createPUTRequest(connToken, jsonObj, dbName, relName) {
            var putRequest = "{\n" +
                "\"token\" : \"" + connToken + "\",\n" +
                "\"dbName\": \"" + dbName + "\",\n" +
                "\"cmd\" : \"PUT\",\n" +
                "\"rel\" : \"" + relName + "\",\n" +
                "\"jsonStr\" : " + jsonObj + "\n" +
            "}";
            return putRequest;
        }

        function createGETRequest(connToken, dbName, relName, jsonKey) {
            var getRequest = "{\n" +
                "\"token\" : \"" + connToken + "\",\n" +
                "\"dbName\": \"" + dbName + "\",\n" +
                "\"cmd\" : \"GET_BY_KEY\",\n" +
                "\"rel\" : \"" + relName + "\",\n" +
                "\"jsonStr\": " + jsonKey + "\n" +
            "}";
            return getRequest;
        }

        function createUPDATERequest(connToken, jsonObj, dbName, relName) {
            var updateRequest = "{\n" +
                "\"token\" : \"" + connToken + "\",\n" +
                "\"dbName\": \"" + dbName + "\",\n" +
                "\"cmd\" : \"UPDATE\",\n" +
                "\"rel\" : \"" + relName + "\",\n" +
                "\"jsonStr\" : " + jsonObj + "\n" +
            "}";
            return updateRequest;
        }

        function executeCommand(reqString, dbBaseUrl, apiEndPointUrl) {
            var url = dbBaseUrl + apiEndPointUrl;
            var jsonObj;
            $.ajax({
                url: url,
                type: "POST",
                data: reqString,
                async: false,
                success: function(result) {
                    jsonObj = JSON.parse(result);
                    console.log("API Success:", jsonObj);
                },
                error: function(result) {
                    var dataJsonObj = result.responseText;
                    jsonObj = JSON.parse(dataJsonObj);
                    console.error("API Error:", jsonObj);
                }
            });
            return jsonObj;
        }

        function resetForm() {
            $("#studentForm")[0].reset();
            $("#rollNo").prop("disabled", false);
            $("#fullName").prop("disabled", true);
            $("#class").prop("disabled", true);
            $("#birthDate").prop("disabled", true);
            $("#address").prop("disabled", true);
            $("#enrollmentDate").prop("disabled", true);
            $("#saveBtn").prop("disabled", true);
            $("#updateBtn").prop("disabled", true);
            $("#resetBtn").prop("disabled", true);
            $("#rollNoMsg").text("");
            $("#rollNo").focus();
        }

        $("#rollNo").on("blur", function() {
            var rollNo = $("#rollNo").val().trim();
            if (rollNo === "") {
                $("#rollNoMsg").text("Roll No is required");
                return;
            }

            var jsonKey = JSON.stringify({ rollNo: rollNo });
            var getReqStr = createGETRequest(CONN_TOKEN, DB_NAME, REL_NAME, jsonKey);

            jQuery.ajaxSetup({ async: false });
            var resultObj = executeCommand(getReqStr, DB_API_URL, API_ENDPOINT);
            jQuery.ajaxSetup({ async: true });

            if (resultObj.status === 200 && resultObj.data && resultObj.data.record) {
                var record = JSON.parse(resultObj.data.record);
                $("#rollNo").prop("disabled", true);
                $("#fullName").prop("disabled", false).val(record.fullName);
                $("#class").prop("disabled", false).val(record.class);
                $("#birthDate").prop("disabled", false).val(record.birthDate);
                $("#address").prop("disabled", false).val(record.address);
                $("#enrollmentDate").prop("disabled", false).val(record.enrollmentDate);
                $("#saveBtn").prop("disabled", true);
                $("#updateBtn").prop("disabled", false);
                $("#resetBtn").prop("disabled", false);
                $("#rollNoMsg").text("Roll No exists");
                $("#fullName").focus();
            } else {
                $("#fullName").prop("disabled", false);
                $("#class").prop("disabled", false);
                $("#birthDate").prop("disabled", false);
                $("#address").prop("disabled", false);
                $("#enrollmentDate").prop("disabled", false);
                $("#saveBtn").prop("disabled", false);
                $("#updateBtn").prop("disabled", true);
                $("#resetBtn").prop("disabled", false);
                $("#rollNoMsg").text("New Roll No");
                $("#fullName").focus();
            }
        });

        $("#saveBtn").on("click", function() {
            var jsonStr = validateAndGetFormData();
            if (jsonStr === "") return;

            var putReqStr = createPUTRequest(CONN_TOKEN, jsonStr, DB_NAME, REL_NAME);

            jQuery.ajaxSetup({ async: false });
            var resultObj = executeCommand(putReqStr, DB_API_URL, API_ENDPOINT);
            jQuery.ajaxSetup({ async: true });

            if (resultObj.status === 200) {
                alert("Student data saved successfully!");
                resetForm();
            } else {
                var errorMsg = resultObj.message || "Unknown error";
                alert("Error saving data: " + errorMsg);
                if (errorMsg.toLowerCase().includes("license") || errorMsg.toLowerCase().includes("limit")) {
                    alert("Database license limit exceeded. Please contact Login2Explore support.");
                }
            }
        });

        $("#updateBtn").on("click", function() {
            var jsonStr = validateAndGetFormData();
            if (jsonStr === "") return;

            var updateReqStr = createUPDATERequest(CONN_TOKEN, jsonStr, DB_NAME, REL_NAME);

            jQuery.ajaxSetup({ async: false });
            var resultObj = executeCommand(updateReqStr, DB_API_URL, API_ENDPOINT);
            jQuery.ajaxSetup({ async: true });

            if (resultObj.status === 200) {
                alert("Student data updated successfully!");
                resetForm();
            } else {
                var errorMsg = resultObj.message || "Unknown error";
                alert("Error updating data: " + errorMsg);
                if (errorMsg.toLowerCase().includes("license") || errorMsg.toLowerCase().includes("limit")) {
                    alert("Database license limit exceeded. Please contact Login2Explore support.");
                }
            }
        });

        $("#resetBtn").on("click", function() {
            resetForm();
        });