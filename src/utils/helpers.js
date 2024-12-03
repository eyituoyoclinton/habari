
class helpers {
   // for checking input fields
   static getInputValueString(inputObj, field) {
      return inputObj instanceof Object &&
         inputObj.hasOwnProperty(field) &&
         typeof inputObj[field] === "string"
         ? inputObj[field].trim()
         : "";
   }
   //generate randon string
   static generateReferenceCode(len) {
      let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";

      let xLen = characters.length - 1;
      for (let i = 0; i < len; i++) {
         code += characters.charAt(Math.random() * xLen);
      }
      return code;
   };

   //making http outgoing request
   static async makeHttpRequest({
      url,
      method,
      json,
      form,
      formData,
      headers,
   }) {
      return new Promise((resolve, reject) => {
         request(
            {
               url,
               method: method,
               form: form,
               json: json,
               headers: headers,
               formData: formData,
            },
            (error, res, body) =>
               resolve(error ? { error: error } : body)
         );
      });
   }
}

module.exports = helpers;