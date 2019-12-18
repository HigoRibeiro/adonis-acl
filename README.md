# Adonis ACL

Adonis ACL adds role based permissions to built in [Auth System](https://github.com/adonisjs/adonis-auth) of [Adonis Framework](https://github.com/adonisjs/adonis-framework).

[![NPM Version](https://img.shields.io/npm/v/adonis-acl.svg?style=flat-square)](https://www.npmjs.com/package/@rocketseat/adonis-acl)
[![GitHub license](https://img.shields.io/github/license/Rocketseat/adonis-acl.svg)](https://github.com/Rocketseat/adonis-acl/blob/master/LICENSE.md)
[![Build Status](https://travis-ci.org/enniel/adonis-acl.svg?branch=master)](https://travis-ci.org/enniel/adonis-acl)
[![Coverage Status](https://coveralls.io/repos/github/Rocketseat/adonis-acl/badge.svg?branch=master)](https://coveralls.io/github/Rocketseat/adonis-acl?branch=master)

## Installation

1. Add package:

```bash
$ adonis install @rocketseat/adonis-acl
```

2. Register ACL providers inside the your start/app.js file.

```js
const providers = [
  ...
  '@rocketseat/adonis-acl/providers/AclProvider',
  ...
]

const aceProviders = [
  ...
  '@rocketseat/adonis-acl/providers/CommandsProvider',
  ...
]
```

3. Setting up traits to `User` model.

```js
class User extends Model {
  ...
  static get traits () {
    return [
      '@provider:Adonis/Acl/HasRole',
      '@provider:Adonis/Acl/HasPermission'
    ]
  }
  ...
}
```

4. Setting up middlewares inside `start/kernel.js` file.

```js
const namedMiddleware = {
  ...
  is: 'Adonis/Acl/Is',
  can: 'Adonis/Acl/Can',
  acl: 'Adonis/Acl/Acl',
  scope: 'Adonis/Acl/Scope'
  ...
}
```

For using in views

```js
const globalMiddleware = [
  ...
  'Adonis/Acl/Init'
  ...
]
```

6. Publish the package migrations to your application and run these with `adonis migration:run`.

```bash
$ adonis acl:setup
```

## Working With Roles

### Create Role

Lets create your first roles.

```js
const roleAdmin = new Role();
roleAdmin.name = "Administrator";
roleAdmin.slug = "administrator";
roleAdmin.description = "manage administration privileges";

await roleAdmin.save();

const roleModerator = new Role();
roleModerator.name = "Moderator";
roleModerator.slug = "moderator";
roleModerator.description = "manage moderator privileges";

await roleModerator.save();
```

Before, you should do first, use the `HasRole` trait in Your `User` Model.

```js
class User extends Model {
  ...
  static get traits () {
    return [
      '@provider:Adonis/Acl/HasRole'
    ]
  }
  ...
}
```

### Attach Role(s) To User

```js
const user = await User.find(1);
await user.roles().attach([roleAdmin.id, roleModerator.id]);
```

### Detach Role(s) From User

```js
const user = await User.find(1);
await user.roles().detach([roleAdmin.id]);
```

### Get User Roles

Get roles assigned to a user.

```js
const user = await User.first();
const roles = await user.getRoles(); // ['administrator', 'moderator']
```

## Working With Permissions

### Create Role Permissions

```js
const createUsersPermission = new Permission();
createUsersPermission.slug = "create_users";
createUsersPermission.name = "Create Users";
createUsersPermission.description = "create users permission";
await createUsersPermission.save();

const updateUsersPermission = new Permission();
updateUsersPermission.slug = "update_users";
updateUsersPermission.name = "Update Users";
updateUsersPermission.description = "update users permission";
await updateUsersPermission.save();

const deleteUsersPermission = new Permission();
deleteUsersPermission.slug = "delete_users";
deleteUsersPermission.name = "Delete Users";
deleteUsersPermission.description = "delete users permission";
await deleteUsersPermission.save();

const readUsersPermission = new Permission();
readUsersPermission.slug = "read_users";
readUsersPermission.name = "Read Users";
readUsersPermission.description = "read users permission";
await readUsersPermission.save();
```

Before, you should do first, use the `HasPermission` trait in Your `User` Model.

```js
class User extends Model {
  ...
  static get traits () {
    return [
      '@provider:Adonis/Acl/HasPermission'
    ]
  }
  ...
}
```

### Attach Permissions to Role

```js
const roleAdmin = await Role.find(1);
await roleAdmin
  .permissions()
  .attach([
    createUsersPermission.id,
    updateUsersPermission.id,
    deleteUsersPermission.is,
    readUsersPermission.id
  ]);
```

### Detach Permissions from Role

```js
const roleAdmin = await Role.find(1);
await roleAdmin
  .permissions()
  .detach([
    createUsersPermission.id,
    updateUsersPermission.id,
    deleteUsersPermission.is,
    readUsersPermission.id
  ]);
```

### Get User Permissions

Get permissions assigned to a role.

```js
const roleAdmin = await Role.find(1);
// ['create_users', 'update_users', 'delete_users', 'read_users']
await roleAdmin.getPermissions();
```

or

```js
const roleAdmin = await Role.find(1);
// collection of permissions
await roleAdmin.permissions().fetch();
```

## Protect Routes

Syntax:

`and` - administrator and moderator

`or` - administrator or moderator

`not (!)` - administrator and !moderator

```js
// check roles
Route.get("/users").middleware([
  "auth:jwt",
  "is:(administrator or moderator) and !customer"
]);

// check permissions
Route.get("/posts").middleware(["auth:jwt", "can:read_posts"]);

// check roles and permissions
Route.put("/posts").middleware(["auth:jwt", "acl:admin or update_posts"]);

// scopes (using permissions table for scopes)
Route.get("/posts").middleware(["auth:jwt", "scope:posts.*"]);
```
The `acl` **middleware** is used to verify both a role and a permission at the same time, but for it to work properly it is necessary that a `role` and a `permission` doesn't share the same name.

## Vow trait

`adonis-acl` has a `trait` to make it easy to use it while testing with `adonis-vow`. To enable the `addRoles` and `addPermissions` methods, you need to add the trait `Acl/Client`.

The arguments must be your roles or permissions.

```js
const [admin, moderator] = await Role.all();
addRole(admin, moderator);
```

```js
const [create, read, update, del] = await Permission.all();
addPermission(create, read, update, del);
```

Here's an example of how to use it inside a test:

```js
const { test, trait } = use("Test/Suite")("Awesome test");

trait("Test/ApiClient");
trait("Auth/Client");
trait("Acl/Client");

test("awesome some test", async ({ client }) => {
  const role = await Role.find(1);
  const permission = await Permission.find(1);
  const user = await User.find(1);

  const response = await client
    .put("/posts/1")
    .loginVia(user)
    .addRoles(role)
    .addPermissions(permission)
    .end();
});
```

Both `addRoles` and `addPermissions` inject roles and permissions on the user that was passed by `loginVia` method, so it is vital to call them after `loginVia` as seen on the example above.

It is also crucial that `trait("Auth/Client")` is called before `trait("Acl/Client")`.

## Using commands

| Command                                             | Description                                                                     | Options                                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| adonis acl:setup                                    | Publish the package migrations to your application                              |                                                                                              |
| adonis acl:role \<slug\> [name][description]        | Make a new role                                                                 | --permissions=\<slug list of permissions separated by comma\> Attach permissions to the role |
| adonis acl:permissions \<slug\> [name][description] | Make a new permission or updates the name and description if the slug was found |                                                                                              |

## Using in Views

```
@loggedIn
  @is('administrator')
    <h2>Protected partial</h2>
  @endis
@endloggedIn
```

or

```
@loggedIn
  @can('create_posts or delete_posts')
    <h2>Protected partial</h2>
  @endcan
@endloggedIn
```

or

```
@loggedIn
  @scope('posts.create', 'posts.delete')
    <h2>Protected partial</h2>
  @endscope
@endloggedIn
```

## Credits

- [Evgeni Razumov](https://github.com/enniel)

## Support

Having trouble? [Open an issue](https://github.com/enniel/adonis-acl/issues/new)!

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
