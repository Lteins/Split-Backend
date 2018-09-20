# Split Back-End
Server-side of a group expense manger application which automatically merge multiple group liabilities into one transaction per person. 
## API EndPoint
### /api/createUser
Create a new user with user-name, email and password. Cannot have duplicate email but accepts duplicate user-name.

Request Body:  
```json
{	"name": String, //user name
	"email": String, //user email
	"password": String //user password}
```
Response:

```json
{"success": true/false,
 "user": {
	 "name": String, //User Name
	 "email": String, //User Email
	 "ifImg": Boolean, //If User uploads profile Img
	 "groups": [Strings], //uuids of the groups the user belongs to
	 "notifications": [Strings], //uuids of notifications related to liabilities 
 }
}
```

Error:
```
 1. Validatioin Fail (Info Miss OR User Duplicate)
```  
### /api/signIn
Sign in to get the token used in exchange for user-related information

Request Body:
```json
{ "email": String, //User Email
  "password": Boolean, //Password encryped in SHA256
}
```
Response:
```json
{ "token": String, //Auto-generated session token }
```

Error:
```
1. User not found
2. Password Unmatched
```
### /api/getUserById
Get detailed information about a user using the token id.
Request Body:
```json
{"token": String, //user token obtained by signin
 "id": String, //uuid that marks user in database OPTIONAL
}
```
Reponse:
```json
{
 "user": {
	 "name": String, //User Name
	 "email": String, //User Email
	 "ifImg": Boolean, //If User uploads profile Img
	 "groups": [Strings], //uuids of the groups the user belongs to
	 "notifications": [Strings], //uuids of notifications related to liabilities 
 }
}
```
Error:
```
1. Invalid Token
```
### /api/searchUserByEmail
Used to search people and add friend
Request:
```json
{ "email": String //Email of a user }
```
Response:
```json
{ "email": String, //email of the searched user
  "name": String, //user name of the searched user
  "id": String //id of searched user
}
```
Error:
```
1. Invalid Token
2. User not found
```
### /api/updateUserImg
Update/Create the profile image of a user
Request body:
```json
{ "token": String, //user token id
  "name": String //Picture encoded in base64
}
```
Error:
```
1. Invalid token
```
Response:
```json
{ "Reponse": "Image Uploaded Successfully" }
```
Error:
```
1. Invalid Token
```
### /api.updateUser
Update general user information including username, Transfer info
Request body:
```json
{ "token": String, //user token id,
  "name": String, //new user name, (OPTIONAL)
  "type": String, //Bank Account Type, (VISA/MASTER/PAYPAL)
  "num": String, //Account Routine Number
}
```
Error: 
```
1.  Invalid Token
```
### /api/createGroup
Create a new travel group
```json
{ "token": String, //user token id,
  "title": String, //title displayed for the group (OPTIONAL)
  "startDate": Stringified Date Type, //(OPTIONAL) 
  "endDate": Stringified Data type, //(OPTIONAL)
}
```
Error
```
1. Invalid Token
2. Invalid Date Object 
```
### /api/getGroupById
Get Group info through id
```json
{ "token": String, //user token id,
  "id": String, //Group Id
}
```
Error
```
1. Invalid token
2. Group not found
```
### /api/updateGroupImg
Update Group Image
```json
{ "token": String, //user token id,
  "groupId": String, //Group Id,
  "img": String, //Group Image encoded in base64 (OPTIONAL)
}
```
Error:
```
1. Invalid token
2. Group not found
```
### /api/updateGroupInfo
Update general group info
```json
{ "token": String, //user token id,
  "groupId": String, //Group Id,
  "title": String, //Updated group title
  "startDate": Stringified Date Type, //(OPTIONAL) 
  "endDate": Stringified Data type, //(OPTIONAL)
}
```
Erro:
```
1. Invalid token
2. Group not found
```
### /api/addMember
Add a person into potential group member and send notification to that person
```json
{ "token": String, //user token id
  "groupId": String, //group id
  "target": String //id of the person to be added (First search using searchUserByEmail)
}
``` 
Error:
1. User not Found
2. Group not Found
3. Invalid Token
### /api/createBill
Create a bill information created during the group travel, where the user who initiates this bill is automatically regarded as the payer for this bill for everyone who participates in the activity. Then, notifications are sent to participants
```json
{ "token": String, //user token id,
  "participants": String[], //Arrays of user id of participants
  "group": String, //group id
  "amount": Integer, //amount of the bill
  "type": Integer  //type of the bill
}
```
Error:
```
1. Invalid token
2. User not found
3. Group not found
```
Type Parameter: 

> 1. airplane
> 2. Tea
> 3. Breakfast
> 4. Transportation
> 5. Hotel
> 6. Undefined

### /api/reply
Reply to a group invitation
```json
{ token: String, //user token id
  id : String, //id of the notifications the users are responding to
  response: Int // 0 -Accpet, 1 - Decline
}
```
Error: 
1. Invalid token
2. Invalid response
3. Notification not found
### /api/getSuspended 
Return all suspended group invitation and unread bill notifications related to a user
```json
{ "token": String //user token id }
```
Error:
```
1. Invalid token
```
