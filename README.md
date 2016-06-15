Tappy Communication Messaging Protocol (TCMP) commany family for
Tappy system commands and responses. 

## Installation
Bower
```
bower install tappy-systemfamily
```

NPM
```
npm install @taptrack/tappy-systemfamily
```
## Commands
```javascript
var SystemFamily = require('tappy-systemfamily');
var Commands = SystemFamily.Commands;

// Request that the Tappy report its hardware version
var = Commands.GetHardwareVersion()

// Request that the Tappy report its firmware version
var = Commands.GetFirmwareVersion()

// Request that the Tappy report its battery level 
var = Commands.GetBattery()

// Request that the Tappy reply with a ping of its own
// Note that while this is usually used for connectivity testing,
// like all commands, it will cause the Tappy to stop doing 
// most long-running  operations, which may or may not be desirable
var = Commands.Ping()

// Set a config parameter on the Tappy both parameters should be values
// that can fit in a single byte
var = Commands.SetConfigItem(configParameter, configValue)
```
## Responses
Note, you should only manually construct responses as below for testing 
purposes. in practise, please use the resolver described later to convert 
raw tcmp messages received from the tappy into their corresponding concrete
response types with the payloads parsed appropriately.
```javascript
var SystemFamily = require('tappy-systemfamily');
var Responses = SystemFamily.Responses;

// a config byte was successfully set
var configSuccess = new Responses.ConfigItemSuccess();

// the Tappy received a command with an incorrect CRC
var crcMismatch = new Responses.CrcMismatch();

// response indicating the Tappy's firmware version
var firmwareVersion = new Responses.FirmwareVersion();
firmwareVersion.getMajorVersion();
firmwareVersion.getMinorVersion();

// response indicating the Tappy's hardware version
var hardwareVersion = new Responses.HardwareVersion();
hardwareVersion.getMajorVersion();
hardwareVersion.getMinorVersion();

// response indicating the approximate battery level 
// of the Tappy. If the Tappy doesn't have a battery,
// a level will still be reported, but its value will be
// largely random and should not be used
var batteryLevel = new Responses.BatteryLevel();
// the battery level in percent
batteryLevel.getBatteryLevel();

// a message was recieved, but the format was incorrect
// rendering the tappy unable to process it
var improperFormat = new Responses.ImproperMessageFormat();

// a message was recieved, but the length checksum was incorrect
var lcsMismatch = new Responses.LcsMismatch();

// a message was recieved, but the message claimed length does not
// match the actual frame length
var lenMismatch = new Responses.LengthMismatch();

// reply to a Ping command
var ping = new Responses.Ping();

// an error occured executing a command 
var systemError = new Responses.SystemError();
// retrieve the command family-specific error code as per SystemFamily.ErrorCodes 
systemError.getErrorCode();
// retrieve the internal-use error code 
systemError.getInternalErrorCode();
// retrieve the status reported by the Tappy's NFC Controller
systemError.getReaderStatusCode();
// retrieve the text message describing the error (may be empty string)
systemError.getErrorMessage();

```

## Resolver
While you can manually resolve raw TCMP messages received from the Tappy using 
getCommandFamily(), getCommandCode(), getPayload(), and parsePayload(), it is 
much more convenient to use the built-in resolvers and isTypeOf().
```javascript
var resolver = new System.Resolver();

// first check to see if the family matches this can be used to multiplex 
// multiple resolvers from different families
if(resolver.checkFamily(responseMsg) {
    // resolution will throw if the command family doesn't match, so it is
    // advisable to check that first. additionally, resolution will return
    // null if there is no matching command code in the library
    var resolved = resolver.resolveResponse(responseMsg);
    if(HardwareVersion.Responses.isTypeOf(resolved)) {
        console.log("Hardware version v"+resolved.getMajorVersion()+"."+resolved.getMinorVersion());
    }
}

```

There is a corresponding resolveCommand for commands in case you are storing
commands in a raw form. Note that commands and responses have overlapping 
commandCode space, so keep track of whether the message was sent to the Tappy
or received from it and use the appropriate resolution function.

