var Family = require("../src/system.js");
var Commands = Family.Commands;
var Responses = Family.Responses;
var Resolver = Family.Resolver;

describe("Test system family parsing",function() {
    
    it("Test commands' familiy codes",function() {
        for(var prop in Commands) {
            expect([].slice.call((new Commands[prop]()).getCommandFamily())).toEqual([0x00,0x00]);
        }
    });

    it("Test responses' familiy codes",function() {
        for(var prop in Responses) {
            expect([].slice.call((new Responses[prop]()).getCommandFamily())).toEqual([0x00,0x00]);
        }
    });
    
    var testCmd = function(constructor, code) {
        var cmd = new constructor();
        expect(cmd.getCommandCode()).toEqual(code);
    };

    it("Test Command codes", function() {
       testCmd(Commands.GetFirmwareVersion,0xFF);
       testCmd(Commands.GetHardwareVersion,0xFE);
       testCmd(Commands.GetBatteryLevel,0x02);
       testCmd(Commands.Ping,0xFD);
       testCmd(Commands.SetConfigItem,0x01);
    });

    it("Test command payloads",function() {
        var cmd = new Commands.SetConfigItem(0x02,0x05);
        expect([].slice.call(cmd.getPayload())).toEqual([0x02,0x05]);
        cmd.parsePayload([0x07,0x12]);
        expect(cmd.getParam()).toEqual(0x07);
        expect(cmd.getValue()).toEqual(0x12);
    });

    it("Test response command codes", function() {
        testCmd(Responses.ConfigItemSuccess,0x07);
        testCmd(Responses.CrcMismatch,0x03);
        testCmd(Responses.FirmwareVersion,0x06);
        testCmd(Responses.BatteryLevel,0x08);
        testCmd(Responses.HardwareVersion,0x05);
        testCmd(Responses.ImproperMessageFormat,0x01);
        testCmd(Responses.LcsMismatch,0x02);
        testCmd(Responses.LengthMismatch,0x04);
        testCmd(Responses.Ping,0xFD);
        testCmd(Responses.SystemError,0x7F);
    });

    it("Test response payloads", function() {
        var cmd = null;

        cmd = new Responses.FirmwareVersion(0x04,0x07);
        expect([].slice.call(cmd.getPayload())).toEqual([0x04,0x07]);
        cmd.parsePayload([0x11,0x23]);
        expect(cmd.getMajorVersion()).toEqual(0x11);
        expect(cmd.getMinorVersion()).toEqual(0x23);

        cmd = new Responses.BatteryLevel(0x05);
        expect([].slice.call(cmd.getPayload())).toEqual([0x05]);
        cmd.parsePayload([0x54]);
        expect(cmd.getBatteryLevel()).toEqual(84);
        
        cmd = new Responses.HardwareVersion(0x4,0x07);
        expect([].slice.call(cmd.getPayload())).toEqual([0x04,0x07]);
        cmd.parsePayload([0x11,0x23]);
        expect(cmd.getMajorVersion()).toEqual(0x11);
        expect(cmd.getMinorVersion()).toEqual(0x23);

        cmd = new Responses.SystemError(0x03,0x07,0x74,"Test");
        expect([].slice.call(cmd.getPayload())).toEqual([0x03,0x07,0x74,0x54,0x65,0x73,0x74]);
        cmd.parsePayload([0x55,0x21,0xF5,0x58]);
        expect(cmd.getErrorCode()).toEqual(0x55);
        expect(cmd.getInternalErrorCode()).toEqual(0x21);
        expect(cmd.getReaderStatusCode()).toEqual(0xF5);
        expect(cmd.getErrorMessage()).toEqual("X");

    });

    it("Test command resolver",function(){
        var resolver = new Resolver();
        var resolved = null;
        
        var basicCheck = function(res,name) {
            expect(res).not.toEqual(null,name);
            expect(typeof res).toBe("object",name);
        };

        resolved = resolver.resolveCommand({
            getCommandCode: function() {
                return 0x01;
            },
            getCommandFamily: function() {
                return [0x00,0x00];
            },
            getPayload: function() {
                return [0x07,0x09];
            }
        });
        basicCheck(resolved,"SetConfigItem");
        expect(typeof resolved.getParam).toBe("function");
        expect(typeof resolved.getValue).toBe("function");
        expect(resolved.getParam()).toEqual(0x07);
        expect(resolved.getValue()).toEqual(0x09);

        for(var cKey in Commands) {
            basicCheck(resolver.resolveCommand(new Commands[cKey]()),cKey);
        }
        
        resolved = resolver.resolveResponse({
            getCommandCode: function() {
                return 0x05;
            },
            getCommandFamily: function() {
                return [0x00,0x00];
            },
            getPayload: function() {
                return [0x07,0x09];
            }
        });
        
        basicCheck(resolved,"HardwareVersion");
        expect(typeof resolved.getMajorVersion).toBe("function");
        expect(typeof resolved.getMinorVersion).toBe("function");
        expect(resolved.getMajorVersion()).toEqual(0x07);
        expect(resolved.getMinorVersion()).toEqual(0x09);
        
        for(var rKey in Responses) {
            basicCheck(resolver.resolveResponse(new Responses[rKey]()),rKey);
        }
    });
});

describe("Test typeof",function() {
    var testType = function(constructor) {
        return function() {
            var testCmd = new constructor();
            expect(constructor.isTypeOf(testCmd)).toBe(true);
        };
    };

    for(var ckey in Commands) {
        it("Command "+ckey+" should pass its own isTypeOf",testType(Commands[ckey]));
    }
    
    for(var rkey in Responses) {
        it("Response "+rkey+" should pass its own isTypeOf",testType(Responses[rkey]));
    }
});
