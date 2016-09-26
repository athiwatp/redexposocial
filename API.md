# RedExpoSocial  API
REST API

## Table of requests

### Users

| METHOD  | URL     | Url params | Body params |
| ------- | ------- | ---------- | ----------- |
| **GET** | /users  | -          | -           |

**Description**

Gets all users of the platform.

Only accessible with access level 3 or grater.

**Success response**

```javascript
{'users':
  [
    {
      'name': {
        'firstName': String,
        'lastName': String
      },
      'contact': {
        'phone': String,
        'social': {
          'facebook': String,
          'twitter': String
        }
      },
      'image': String,
      'bio': String,
      'location': {
        'city': String,
        'state': String,
        'country': String
      },
      'email': String,
      'username': String,
    }
  ]
}
```


**Error response**
