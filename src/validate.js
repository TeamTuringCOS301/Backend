module.exports = {
  validateEmail(email){
    if(typeof email !== "string"){
      return false;
    }
    var regexEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(regexEmail.test(email)){
      return true;
    }else{
      return false;
    }
  },

  validateName(name){
    if(typeof name !== "string" || name.length == 0){
      return false;
    }else{
      return true;
    }
  },

  validateUsername(username){
    if(typeof username !== "string" || username.length == 0){
      return false;
    }
    return true;
  },

  validatePassword(password){
    if(typeof password !== "string" || password.length == 0){
      return false;
    }
    return true;
  },

  validateText(text){
    if(typeof text !== "string" || text.length == 0){
      return false;
    }else{
      return true;
    }
  },

  validatePoint(point){
    if(typeof point.lat !== "number" || typeof point.lng !== "number" ){
      return false;
    }
    if(point.lat < -90 || point.lat > 90 || point.lng < -180 || point.lng > 180){
      return false;
    }
    return true;
  }
};
