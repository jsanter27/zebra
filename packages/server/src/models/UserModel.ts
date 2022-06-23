import {
  Table,
  Column,
  Model,
  Default,
  AllowNull,
  PrimaryKey,
  Is,
  BeforeCreate,
  BeforeUpdate,
  BeforeBulkUpdate,
} from "sequelize-typescript";
import bcrypt from "bcrypt";
import logger from "debug";
import { UpdateOptions, Optional } from "sequelize";

const debug = logger("zebra:users");

/**
 * Regex used for validating ZEBRA usernames. Uses the following criteria:
 * - alphanumeric characters
 * - can include `_` and `-`
 * - length of 3 to 16 characters
 */
const USERNAME_REGEX = /^[a-z0-9_-]{3,16}$/;

/**
 * Regex used for validating passwords provided by users. Uses the following criteria:
 * - at least 1 lowercase letter
 * - at least 1 uppercase letter
 * - at least 1 number
 * - at least 8 characters long
 */
const PASSWORD_REGEX =
  /(?=(.*[0-9]))((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.{8,}$/;

/**
 * The amount of salt rounds used to hash API key and password.
 */
const SALT_ROUNDS = 10;

/**
 * The attributes of a User.
 */
export type UserAttributes = {
  /**
   * User's unique identifying name. Uses the following criteria:
   * - alphanumeric characters
   * - can include `_` and `-`
   * - length of 3 to 16 characters
   */
  username: string;
  /**
   * User's password (is stored as a hash in the database).
   */
  password: string;
  /**
   * User's role / permissions. Default is `read`, where you can only GET metrics. Users with `read-write` permissions
   * can change configuration, custom metrics, etc.
   */
  role: "read" | "read-write";
  /**
   * Flag indicating if the User will be forced to change password on next login.
   */
  changePasswordOnLogin: boolean;
};

/**
 * The attributes needed for creating a User.
 */
export type UserCreationAttributes = Optional<
  UserAttributes,
  "role" | "changePasswordOnLogin"
>;

/**
 * ZEBRA User object. For client-side use.
 */
export type UserObj = Omit<
  UserAttributes,
  "password" | "changePasswordOnLogin"
>;

/**
 * Model used for ZEBRA users.
 */
@Table({ tableName: "users" })
export default class UserModel extends Model<
  UserAttributes,
  UserCreationAttributes
> {
  /**
   * User's unique identifying name. Uses the following criteria:
   * - alphanumeric characters
   * - can include `_` and `-`
   * - length of 3 to 16 characters
   */
  @PrimaryKey
  @Is(USERNAME_REGEX)
  @Column
  public username!: string;

  /**
   * User's password hash (stored as a hash in the dataabase).
   */
  @AllowNull(false)
  @Column
  public password!: string;

  /**
   * User's role / permissions. Default is `read`, where you can only GET metrics. Users with `read-write` permissions
   * can change configuration, custom metrics, etc.
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
      const initUser = new this({
        username: "root",
        password: "?Zebra3090",
        role: "read-write",
      });
      await initUser
        .save()
        .then((user) => {
          debug(`Root user initalized with username '${user.username}'.`);
        })
        .catch((err) => {
          throw err;
        });
    } else {
      debug(`Root user already initialized.`);
    }
  }

  /**
   * Sets the parameter `individualHooks` to be `true` for all User queries. Removes the need
   * for specifying with each query.
   * @param options The options for the UPDATE query being passed through the hook.
   */
  @BeforeBulkUpdate
  public static enableIndividualHooks(options: UpdateOptions): void {
    options.individualHooks = true;
  }

  /**
   * Hashes the given password and stores the encrypted version.
   * @param user User instance that is being passed through the hook.
   */
  @BeforeCreate
  @BeforeUpdate
  public static async encryptPassword(user: UserModel): Promise<void> {
    if (user.changed("password")) {
      if (!PASSWORD_REGEX.test(user.password)) {
        throw new Error("Password doesn't follow the correct format.");
      }
      user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
    }
  }

  /**
   * Checks the given password with the stored hash and verifies if it is correct.
   * @param password Plain text password to compare with hash.
   * @returns `true` if the password is a correct match, `false` if not.
   */
  public async checkPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
