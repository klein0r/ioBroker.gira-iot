'use strict';

const giraChannels = {
    'de.gira.schema.channels.Switch': {
        OnOff: {
            common: {
                name: 'OnOff',
                type: 'boolean',
                role: 'switch.power',
                read: true,
                write: true,
            },
            type: 'binary',
            mandatory: true,
            eventing: true,
        },
    },
    'de.gira.schema.channels.KNX.Dimmer': {
        OnOff: {
            common: {
                name: 'OnOff',
                type: 'boolean',
                role: 'switch.power',
                read: true,
                write: true,
            },
            type: 'binary',
            mandatory: true,
            eventing: true,
        },
        Shift: {
            common: {
                name: 'Shift',
                type: 'number',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'percentage',
            mandatory: false,
            eventing: false,
        },
        Brightness: {
            common: {
                name: 'Brightness',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
                min: 0,
                max: 100,
                unit: '%',
            },
            type: 'percent',
            mandatory: false,
            eventing: true,
        },
    },
    'de.gira.schema.channels.DimmerRGBW': {
        OnOff: {
            common: {
                name: 'OnOff',
                type: 'boolean',
                role: 'switch.power',
                read: true,
                write: true,
            },
            type: 'binary',
            mandatory: true,
            eventing: true,
        },
        Brightness: {
            common: {
                name: 'Brightness',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
                min: 0,
                max: 100,
                unit: '%',
            },
            type: 'percent',
            mandatory: false,
            eventing: true,
        },
        Red: {
            common: {
                name: 'Red',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
                min: 0,
                max: 100,
                unit: '%',
            },
            type: 'percent',
            mandatory: true,
            eventing: true,
        },
        Green: {
            common: {
                name: 'Green',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
                min: 0,
                max: 100,
                unit: '%',
            },
            type: 'percent',
            mandatory: true,
            eventing: true,
        },
        Blue: {
            common: {
                name: 'Blue',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
                min: 0,
                max: 100,
                unit: '%',
            },
            type: 'percent',
            mandatory: true,
            eventing: true,
        },
        White: {
            common: {
                name: 'White',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
                min: 0,
                max: 100,
                unit: '%',
            },
            type: 'percent',
            mandatory: false,
            eventing: true,
        },
    },
    'de.gira.schema.channels.DimmerWhite': {
        OnOff: {
            common: {
                name: 'OnOff',
                type: 'boolean',
                role: 'switch.power',
                read: true,
                write: true,
            },
            type: 'binary',
            mandatory: true,
            eventing: true,
        },
        Brightness: {
            common: {
                name: 'Brightness',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
                min: 0,
                max: 100,
                unit: '%',
            },
            type: 'percent',
            mandatory: false,
            eventing: true,
        },
        'Color-Temperature': {
            common: {
                name: 'Color-Temperature',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'float',
            mandatory: true,
            eventing: true,
        },
    },
    'de.gira.schema.channels.BlindWithPos': {
        'Step-Up-Down': {
            common: {
                name: 'Step-Up-Down',
                type: 'boolean',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'binary',
            mandatory: true,
            eventing: false,
        },
        'Up-Down': {
            common: {
                name: 'Up-Down',
                type: 'boolean',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'binary',
            mandatory: true,
            eventing: false,
        },
        Movement: {
            common: {
                name: 'Movement',
                type: 'boolean',
                role: 'state',
                read: true,
                write: false,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        Position: {
            common: {
                name: 'Position',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
                min: 0,
                max: 100,
                unit: '%',
            },
            type: 'percent',
            mandatory: false,
            eventing: true,
        },
        'Slat-Position': {
            common: {
                name: 'Slat-Position',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
                min: 0,
                max: 100,
                unit: '%',
            },
            type: 'percent',
            mandatory: false,
            eventing: true,
        },
    },
    'de.gira.schema.channels.Trigger': {
        Trigger: {
            common: {
                name: 'Trigger',
                type: 'boolean',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'binary',
            mandatory: true,
            eventing: true,
        },
    },
    'de.gira.schema.channels.SceneSet': {
        Execute: {
            common: {
                name: 'Execute',
                type: 'number',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'integer',
            mandatory: true,
            eventing: true,
        },
        Teach: {
            common: {
                name: 'Teach',
                type: 'number',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'integer',
            mandatory: false,
            eventing: true,
        },
    },
    'de.gira.schema.channels.SceneControl': {
        Scene: {
            common: {
                name: 'Scene',
                type: 'number',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'integer',
            mandatory: true,
            eventing: false,
        },
    },
    'de.gira.schema.channels.RoomTemperatureSwitchable': {
        Current: {
            common: {
                name: 'Current',
                type: 'number',
                role: 'value.temperature',
                read: true,
                write: false,
                unit: '°C',
            },
            type: 'float',
            mandatory: true,
            eventing: true,
        },
        'Set-Point': {
            common: {
                name: 'Set-Point',
                type: 'number',
                role: 'level.temperature',
                read: true,
                write: true,
                unit: '°C',
            },
            type: 'float',
            mandatory: true,
            eventing: true,
        },
        OnOff: {
            common: {
                name: 'OnOff',
                type: 'boolean',
                role: 'switch.power',
                read: true,
                write: true,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
    },
    'de.gira.schema.channels.KNX.HeatingCoolingSwitchable': {
        Current: {
            common: {
                name: 'Current',
                type: 'number',
                role: 'value.temperature',
                read: true,
                write: false,
                unit: '°C',
            },
            type: 'float',
            mandatory: true,
            eventing: true,
        },
        'Set-Point': {
            common: {
                name: 'Set-Point',
                type: 'number',
                role: 'level.temperature',
                read: true,
                write: true,
                unit: '°C',
            },
            type: 'float',
            mandatory: true,
            eventing: true,
        },
        Mode: {
            common: {
                name: 'Mode',
                type: 'number',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'byte',
            mandatory: false,
            eventing: true,
        },
        Status: {
            common: {
                name: 'Status',
                type: 'number',
                role: 'state',
                read: true,
                write: false,
            },
            type: 'byte',
            mandatory: false,
            eventing: true,
        },
        Presence: {
            common: {
                name: 'Presence',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        Heating: {
            common: {
                name: 'Heating',
                type: 'boolean',
                role: 'state',
                read: true,
                write: false,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        Cooling: {
            common: {
                name: 'Cooling',
                type: 'boolean',
                role: 'state',
                read: true,
                write: false,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        'Heat-Cool': {
            common: {
                name: 'Heat-Cool',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        OnOff: {
            common: {
                name: 'OnOff',
                type: 'boolean',
                role: 'switch.power',
                read: true,
                write: true,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
    },
    'de.gira.schema.channels.KNX.FanCoil': {
        Current: {
            common: {
                name: 'Current',
                type: 'number',
                role: 'state',
                read: true,
                write: false,
            },
            type: 'float',
            mandatory: true,
            eventing: true,
        },
        'Set-Point': {
            common: {
                name: 'Set-Point',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'float',
            mandatory: true,
            eventing: true,
        },
        OnOff: {
            common: {
                name: 'OnOff',
                type: 'boolean',
                role: 'switch.power',
                read: true,
                write: true,
            },
            type: 'binary',
            mandatory: true,
            eventing: true,
        },
        Mode: {
            common: {
                name: 'Mode',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'byte',
            mandatory: true,
            eventing: true,
        },
        'Fan-Speed': {
            common: {
                name: 'Fan-Speed',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'byte',
            mandatory: false,
            eventing: true,
        },
        'Vanes-UpDown-Level': {
            common: {
                name: 'Vanes-UpDown-Level',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'byte',
            mandatory: false,
            eventing: true,
        },
        'Vanes-UpDown-StopMove': {
            common: {
                name: 'Vanes-UpDown-StopMove',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        'Vanes-LeftRight-Level': {
            common: {
                name: 'Vanes-LeftRight-Level',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'byte',
            mandatory: false,
            eventing: true,
        },
        'Vanes-LeftRight-StopMove': {
            common: {
                name: 'Vanes-LeftRight-StopMove',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        Error: {
            common: {
                name: 'Error',
                type: 'boolean',
                role: 'state',
                read: true,
                write: false,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        'Error-Text': {
            common: {
                name: 'Error-Text',
                type: 'string',
                role: 'state',
                read: true,
                write: false,
            },
            type: 'string',
            mandatory: false,
            eventing: true,
        },
    },
    'de.gira.schema.channels.AudioWithPlaylist': {
        Play: {
            common: {
                name: 'Play',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary',
            mandatory: true,
            eventing: true,
        },
        Volume: {
            common: {
                name: 'Volume',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
                min: 0,
                max: 100,
                unit: '%',
            },
            type: 'percent',
            mandatory: true,
            eventing: true,
        },
        Mute: {
            common: {
                name: 'Mute',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        Previous: {
            common: {
                name: 'Previous',
                type: 'boolean',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        Next: {
            common: {
                name: 'Next',
                type: 'boolean',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        Title: {
            common: {
                name: 'Title',
                type: 'string',
                role: 'state',
                read: true,
                write: false,
            },
            type: 'string',
            mandatory: false,
            eventing: true,
        },
        Album: {
            common: {
                name: 'Album',
                type: 'string',
                role: 'state',
                read: true,
                write: false,
            },
            type: 'string',
            mandatory: false,
            eventing: true,
        },
        Artist: {
            common: {
                name: 'Artist',
                type: 'string',
                role: 'state',
                read: true,
                write: false,
            },
            type: 'string',
            mandatory: false,
            eventing: true,
        },
        Playlist: {
            common: {
                name: 'Playlist',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'byte',
            mandatory: false,
            eventing: true,
        },
        PreviousPlaylist: {
            common: {
                name: 'PreviousPlaylist',
                type: 'boolean',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        NextPlaylist: {
            common: {
                name: 'NextPlaylist',
                type: 'boolean',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        PlaylistName: {
            common: {
                name: 'PlaylistName',
                type: 'string',
                role: 'state',
                read: true,
                write: false,
            },
            type: 'string',
            mandatory: false,
            eventing: true,
        },
        Shuffle: {
            common: {
                name: 'Shuffle',
                type: 'boolean',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        Repeat: {
            common: {
                name: 'Repeat',
                type: 'boolean',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
    },
    'de.gira.schema.channels.Sonos.Audio': {
        Play: {
            common: {
                name: 'Play',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary',
            mandatory: true,
            eventing: true,
        },
        Volume: {
            common: {
                name: 'Volume',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
                min: 0,
                max: 100,
                unit: '%',
            },
            type: 'percent',
            mandatory: true,
            eventing: true,
        },
        Mute: {
            common: {
                name: 'Mute',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        Previous: {
            common: {
                name: 'Previous',
                type: 'boolean',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        Next: {
            common: {
                name: 'Next',
                type: 'boolean',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        Title: {
            common: {
                name: 'Title',
                type: 'string',
                role: 'state',
                read: true,
                write: false,
            },
            type: 'string',
            mandatory: false,
            eventing: true,
        },
        Album: {
            common: {
                name: 'Album',
                type: 'string',
                role: 'state',
                read: true,
                write: false,
            },
            type: 'string',
            mandatory: false,
            eventing: true,
        },
        Artist: {
            common: {
                name: 'Artist',
                type: 'string',
                role: 'state',
                read: true,
                write: false,
            },
            type: 'string',
            mandatory: false,
            eventing: true,
        },
        Playlist: {
            common: {
                name: 'Playlist',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'byte',
            mandatory: false,
            eventing: true,
        },
        PreviousPlaylist: {
            common: {
                name: 'PreviousPlaylist',
                type: 'boolean',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        NextPlaylist: {
            common: {
                name: 'NextPlaylist',
                type: 'boolean',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        PlaylistName: {
            common: {
                name: 'PlaylistName',
                type: 'string',
                role: 'state',
                read: true,
                write: false,
            },
            type: 'string',
            mandatory: false,
            eventing: true,
        },
        Shuffle: {
            common: {
                name: 'Shuffle',
                type: 'boolean',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        Repeat: {
            common: {
                name: 'Repeat',
                type: 'boolean',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'binary',
            mandatory: false,
            eventing: true,
        },
        'Shift-Volume': {
            common: {
                name: 'Shift-Volume',
                type: 'number',
                role: 'state',
                read: false,
                write: true,
            },
            type: 'percentage',
            mandatory: false,
            eventing: false,
        },
        Playlists: {
            common: {
                name: 'Playlists',
                type: 'string',
                role: 'state',
                read: true,
                write: false,
            },
            type: 'string',
            mandatory: false,
            eventing: true,
        },
        Cover: {
            common: {
                name: 'Cover',
                type: 'string',
                role: 'state',
                read: true,
                write: false,
            },
            type: 'string',
            mandatory: false,
            eventing: true,
        },
        ValidPlayModes: {
            common: {
                name: 'ValidPlayModes',
                type: 'string',
                role: 'state',
                read: true,
                write: false,
            },
            type: 'string',
            mandatory: false,
            eventing: true,
        },
        TransportActions: {
            common: {
                name: 'TransportActions',
                type: 'string',
                role: 'state',
                read: true,
                write: false,
            },
            type: 'string',
            mandatory: false,
            eventing: true,
        },
        ZoneName: {
            common: {
                name: 'ZoneName',
                type: 'string',
                role: 'state',
                read: true,
                write: false,
            },
            type: 'string',
            mandatory: false,
            eventing: true,
        },
    },
    'de.gira.schema.channels.Camera': {
        Camera: {
            common: {
                name: 'Camera',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary',
            mandatory: true,
            eventing: true,
        },
    },
    'de.gira.schema.channels.Link': {
        Link: {
            common: {
                name: 'Link',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary',
            mandatory: true,
            eventing: true,
        },
    },
    'de.gira.schema.channels.Binary': {
        Binary: {
            common: {
                name: 'Binary',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary',
            mandatory: true,
            eventing: true,
        },
    },
    'de.gira.schema.channels.DWord': {
        DWord: {
            common: {
                name: 'DWord',
                type: 'string',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'dword',
            mandatory: true,
            eventing: true,
        },
    },
    'de.gira.schema.channels.Integer': {
        Integer: {
            common: {
                name: 'Integer',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'integer',
            mandatory: true,
            eventing: true,
        },
    },
    'de.gira.schema.channels.Float': {
        Float: {
            common: {
                name: 'Float',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'float',
            mandatory: true,
            eventing: true,
        },
    },
    'de.gira.schema.channels.String': {
        String: {
            common: {
                name: 'String',
                type: 'string',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'string',
            mandatory: true,
            eventing: true,
        },
    },
    'de.gira.schema.channels.Byte': {
        Byte: {
            common: {
                name: 'Byte',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'byte',
            mandatory: true,
            eventing: true,
        },
    },
    'de.gira.schema.channels.Percent': {
        Percent: {
            common: {
                name: 'Percent',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
                min: 0,
                max: 100,
                unit: '%',
            },
            type: 'percent',
            mandatory: true,
            eventing: true,
        },
    },
    'de.gira.schema.channels.Temperatur': {
        Temperature: {
            common: {
                name: 'Temperature',
                type: 'number',
                role: 'state',
                read: true,
                write: true,
                unit: '°C',
            },
            type: 'float',
            mandatory: true,
            eventing: true,
        },
    },
    'de.gira.schema.channels.RA.RemoteAccess': {
        Enabled: {
            common: {
                name: 'Enabled',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary', // ??
            mandatory: true, // ??
            eventing: true, // ??
        },
        'User-Access': {
            common: {
                name: 'User-Access',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary', // ??
            mandatory: true, // ??
            eventing: true, // ??
        },
        'Installer-Access': {
            common: {
                name: 'Installer-Access',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary', // ??
            mandatory: true, // ??
            eventing: true, // ??
        },
        'Connection-State': {
            common: {
                name: 'Connection-State',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary', // ??
            mandatory: true, // ??
            eventing: true, // ??
        },
        'Access-State': {
            common: {
                name: 'Access-State',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary', // ??
            mandatory: true, // ??
            eventing: true, // ??
        },
        'User-Access-State': {
            common: {
                name: 'User-Access-State',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary', // ??
            mandatory: true, // ??
            eventing: true, // ??
        },
        'Installer-Access-State': {
            common: {
                name: 'Installer-Access-State',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary', // ??
            mandatory: true, // ??
            eventing: true, // ??
        },
        Error: {
            common: {
                name: 'Error',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary', // ??
            mandatory: true, // ??
            eventing: true, // ??
        },
        'Connection-Info': {
            common: {
                name: 'Connection-Info',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary', // ??
            mandatory: true, // ??
            eventing: true, // ??
        },
        'Error-Info': {
            common: {
                name: 'Error-Info',
                type: 'boolean',
                role: 'state',
                read: true,
                write: true,
            },
            type: 'binary', // ??
            mandatory: true, // ??
            eventing: true, // ??
        },
    },
};

function convertValueForState(val, ioType, giraType) {
    let newValue = val;

    if (ioType === 'boolean') {
        newValue = newValue == '1';
    } else if (ioType === 'number') {
        if (['percent', 'integer', 'byte'].includes(giraType)) {
            newValue = parseInt(newValue);
        } else {
            newValue = parseFloat(newValue);
        }
    }

    return newValue;
}

function convertValueForGira(val, ioType) {
    let newValue = val;

    if (ioType === 'boolean') {
        newValue = newValue ? 1 : 0;
    }

    return String(newValue);
}

module.exports = {
    channels: giraChannels,
    convertValueForState: convertValueForState,
    convertValueForGira: convertValueForGira,
};
