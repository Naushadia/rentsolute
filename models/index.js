"use strict";

const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}
sequelize
  .authenticate()
  .then(function (err) {
    console.log("Connection has been established successfully.");
  })
  .catch(function (err) {
    console.log("Unable to connect to the database:", err.message);
  });

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.user = require("./user")(sequelize, DataTypes);
db.option = require("./option")(sequelize, DataTypes);
db.room = require("./room")(sequelize, DataTypes);
db.image = require("./image")(sequelize, DataTypes);
db.propertyamenity = require("./propertyamenity")(sequelize, DataTypes);
db.question = require("./question")(sequelize, DataTypes);
db.amenities = require("./amenities")(sequelize, DataTypes);
db.properties = require("./properties")(sequelize, DataTypes);
db.property_images = require("./property_images")(sequelize, DataTypes);
db.propertyquestion = require("./propertyquestion")(sequelize,DataTypes);
db.sequelize.sync({ alter : true });

db.amenities.belongsToMany(db.properties, {through: db.propertyamenity, as: 'propertyAmenities',onDelete: "CASCADE", onUpdate: "CASCADE"});
db.properties.belongsToMany(db.amenities, {through: db.propertyamenity, as: 'propertyAmenities',onDelete: "CASCADE", onUpdate: "CASCADE"});
db.image.belongsToMany(db.properties,{through: db.property_images,onDelete: "CASCADE", onUpdate: "CASCADE"});
db.properties.belongsToMany(db.image,{through: db.property_images,onDelete: "CASCADE", onUpdate: "CASCADE"});
db.room.belongsTo(db.image, {onDelete: "SET NULL", onUpdate: "CASCADE"});
db.room.belongsTo(db.properties, {onDelete: "SET NULL", onUpdate: "CASCADE"});
db.question.hasMany(db.option, {as: 'Options', onDelete: "SET NULL", onUpdate: "CASCADE"});
db.option.belongsTo(db.question, { onDelete: "SET NULL", onUpdate: "CASCADE"});
db.question.belongsToMany(db.properties, {through: db.propertyquestion, onDelete: "CASCADE", onUpdate: "CASCADE"});
db.properties.belongsToMany(db.question, {through: db.propertyquestion, onDelete: "CASCADE", onUpdate: "CASCADE"});
db.user.hasMany(db.question, {onDelete: "SET NULL", onUpdate: "CASCADE"});
db.question.belongsTo(db.user, {onDelete: "SET NULL", onUpdate: "CASCADE"});
db.user.hasMany(db.properties, {onDelete: "SET NULL", onUpdate: "CASCADE"});
db.properties.belongsTo(db.user, {onDelete: "SET NULL", onUpdate: "CASCADE"});
db.user.hasMany(db.amenities, {onDelete: "SET NULL", onUpdate: "CASCADE"});
db.amenities.belongsTo(db.user, {onDelete: "SET NULL", onUpdate: "CASCADE"})


module.exports = db;
