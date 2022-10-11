if (!process.env.NODE_ENV) process.env.NODE_ENV = "development";

class Config {
  public isDevelopment = process.env.NODE_ENV === "development";
  public isProduction = process.env.NODE_ENV === "production";
  public port = 0;
  public sqlHost = "";
  public sqlUser = "";
  public sqlPassword = "";
  public sqlDatabase = "";
}

class DevelopmentConfig extends Config {
  public port = 3001;
  public sqlHost = "localhost";
  public sqlUser = "root";
  public sqlPassword = "";
  public sqlDatabase = "vinder"; // Database Name
}

class ProductionConfig extends Config {
  public port = +process.env.PORT;
  public sqlHost = "";
  public sqlUser = "";
  public sqlPassword = "";
  public sqlDatabase = "";
}

const config =
  process.env.NODE_ENV === "development"
    ? new DevelopmentConfig()
    : new ProductionConfig();

export default config;
