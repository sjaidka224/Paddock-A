function sendEmailToDb() {

  var email = document.getElementById("exampleInputEmail1").value.indexOf("@");
  var emailForDB = document.getElementById("exampleInputEmail1").value;

  if (email == -1) {
    alert ("Invalid e-mail.");
    return;
  } else {
    var data = {
      email: emailForDB
    };
    uploadDataToDb(data);
  }
}

var uploadDataToDb = function(dataParam) {
  console.log(dataParam);
  $.post('/project',dataParam,function(result){
    console.log ("backendInteraction + uploadDataToDb ", result);
    alert ("We will contact you shortly on " + dataParam.email + ".");
  })
}
