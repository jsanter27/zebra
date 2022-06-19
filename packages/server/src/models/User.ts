import {
  Table,
  Column,
  Model,
  Default,
  AllowNull,
  PrimaryKey,
  Is,
} from "sequelize-typescript";
import logger from "debug";

const debug = logger("zebra:users");

/**
 * Regex used for validating ZEBRA usernames. Uses the following criteria:
 * - alphanumeric characters
 * - can include `_` and `-`
 * - length of 3 to 16 characters
 */
const USERNAME_REGEX = /^[a-z0-9_-]{3,16}$/;

/**
 * Regex used for validating ZEBRA passwords. Uses the following criteria:
 * - at least 1 lowercase letter
 * - at least 1 uppercase letter
 * - at least 1 number
 * - at least 8 characters long
 */
const PASSWORD_REGEX =
  /(?=(.*[0-9]))((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.{8,}$/;

/**
 * Model used for ZEBRA users.
 */
@Table
class User extends Model {
  /**
   * User's unique identifying name.
   */
  @PrimaryKey
  @Is(USERNAME_REGEX)
  @Column
  public username!: string;

  /**
   * User's password.
   */
  @AllowNull(false)
  @Is(PASSWORD_REGEX)
  @Column
  public password!: string;

  /**
   * User's role / permissions. Default is `read`, where you can only GET metrics. Users with `read-write` permissions
   * can change ZEBRA config, DDS config, and custom exposed metrics.
   */
  @Default("read")
  @Column
  public role!: "read" | "read-write";

  /**
   * Flag indicating if the User will be forced to change password on next login.
   */
  @Default(true)
  @Column
  public changePasswordOnLogin!: boolean;

  /**
   * Routine that initializes a ZEBRA user on startup if one doesn't already exist.
   */
  public static async startup(): Promise<void> {
    const { count } = await this.findAndCountAll();
    if (count === 0) {
      const initUser = new this({ username: "admin", password: "Admin2022" });
      await initUser
        .save()
        .then((user) => {
          debug(`Initial user created with username '${user.username}'.`);
        })
        .catch((err) => {
          throw err;
        });
    } else {
      debug(`Initial user already created.`);
    }
  }
}

export default User;
