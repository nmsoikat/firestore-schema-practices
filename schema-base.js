const firestore = require("../utils/db");
// const { checkSchema } = require("express-validator");

class Schema {
  modelName = "";
  schemaObj = {};
  schemaObjKeys = [];
  filteredData = {};

  constructor(modelName, schemaObj) {
    this.schemaObj = schemaObj;
    this.modelName = modelName;
    this.schemaObjKeys = Object.keys(schemaObj); // fields name only
  }

  //@desc:  type of any value
  getType(value) {
    const return_value = Object.prototype.toString.call(value); //Ex. [object Array]

    const type = return_value.substring(
      return_value.indexOf(" ") + 1,
      return_value.indexOf("]")
    ); //Ex. Array

    return type; //Ex. Array
  }

  //@desc:  remove extra field
  removeExtraFields(inputData) {
    let data = {};
    //loop according schema field
    for (let key of this.schemaObjKeys) {
        data = {
          ...data,
          [key]: inputData[key]
        };
    }

    this.filteredData = data;
    return this;
  }

  //@desc:  check type according to schema type
  //@dependency: should call after removeExtraFields() function call
  checkFieldTypes() {
  //loop according schema field
  for (let key of this.schemaObjKeys) {
    // type constructor function // Ex. String, Number
    if (this.getType(this.schemaObj[key]) === "Function") {
      const schemaFieldType = this.schemaObj[key].name; //Ex. String
      const inputFieldType = this.getType(this.filteredData[key]); //Ex. String

      //if no filed according to schema
      if(inputFieldType !== "Undefined"){
        if (schemaFieldType !== inputFieldType) {
          throw new Error(`Type Error(${key}): provided ${inputFieldType}, but need ${schemaFieldType}`);
        }
      }

    } else if(this.getType(this.schemaObj[key]) === "Object"){
      //Ex. phoneNumber: {type: Number}
      if (this.getType(this.schemaObj[key].type) === "Function") {
        const schemaFieldType = this.schemaObj[key].type.name; //Ex. String
        const inputFieldType = this.getType(this.filteredData[key]); //Ex. String
  
      //if no filed according to schema
      if(inputFieldType !== "Undefined"){
        if (schemaFieldType !== inputFieldType) {
          throw new Error(`Type Error(${key}): you have provided ${inputFieldType}, need ${schemaFieldType}`);
        }
      }
      } else{
        throw new Error(`Invalid Type Of (${key})`);
      }

      // Default // 'default' in {} // return boolean
      if ('default' in this.schemaObj[key] && (this.filteredData[key] === undefined)) {
        this.filteredData[key] = this.schemaObj[key].default;
      }

      // if ('required' in this.schemaObj[key] && (this.filteredData[key] === undefined || this.checkEmptyAccordingType(this.filteredData[key]))) {
      //   if(this.filteredData[key]){

      //   }
      // }
    }
  }
    return this
  }

  //@desc:  remove missing field
  //@dependency: should call after checkFieldTypes() function call
  removeMissingField(){
    for(let key in this.filteredData){
      this.filteredData[key] === undefined && delete this.filteredData[key]
    }

    return this;
  }

  //@check all
  schemaCheck(inputData){
    return this.removeExtraFields(inputData).checkFieldTypes().removeMissingField().filteredData
  }

  // CREATE
  async set(inputData) {
    try {
      // const data = this.typeCheckInputFields(inputData);
      // const data = this.filterInputFields(inputData).typeCheckInputFields().filteredData;
      const data = this.schemaCheck(inputData)

      // console.log(data);
      // return;
      const res = await firestore.collection(this.modelName).doc().set(data);

      if (res.writeTime.nanoseconds) {
        return inputData;
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // READ ALL
  async get() {
    try {
      let docs = [];

      const snapshot = await firestore.collection(this.model).get();

      if (!snapshot.empty) {
        snapshot.forEach((doc) => docs.push(doc.data()));
        return docs;
      } else {
        throw new Error("No documents!");
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // READ BY ID
  async getById(id) {
    try {
      const doc = await firestore.collection(this.model).doc(id).get();

      if (doc.exists) {
        return doc.data();
      } else {
        throw new Error("No documents!");
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // UPDATE
  async update(id, data) {
    try {
      const res = await firestore.collection(this.model).doc(id).update(data);

      if (res.writeTime.nanoseconds) {
        return true;
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // DELETE
  async remove(id) {
    try {
      const res = await firestore.collection(collection).doc(id).delete();
      if (res.writeTime.nanoseconds) {
        return true;
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = { Schema };
