import { Sequelize } from "sequelize-typescript";
import path from "path";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "..", "..", "data", "zebra.sqlite"),
  logging: false,
});

sequelize.addModels([path.join(__dirname, "..", "models")]);

export default sequelize;
