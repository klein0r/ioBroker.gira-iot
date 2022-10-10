![Logo](../../admin/gira-iot.png)

# ioBroker.gira-iot

## Channel types

See ``lib/gira-types.js``

| channel type                                         | data point               | type       | M | R W E |
|------------------------------------------------------|--------------------------|------------|---|-------|
| de.gira.schema.channels.Switch                       | OnOff                    | Binary     | M | R W E |
| de.gira.schema.channels.KNX.Dimmer                   | OnOff                    | Binary     | M | R W E |
| de.gira.schema.channels.Switch                       | OnOff                    | Binary     | M | R W E |
| de.gira.schema.channels.KNX.Dimmer                   | OnOff                    | Binary     | M | R W E |
|                                                      | Shift                    | Percentage | O | - W - |
|                                                      | Brightness               | Percent    | O | R W E |
| de.gira.schema.channels.DimmerRGBW                   | OnOff                    | Binary     | M | R W E |
|                                                      | Brightness               | Percent    | O | R W E |
|                                                      | Red                      | Percent    | M | R W E |
|                                                      | Green                    | Percent    | M | R W E |
|                                                      | Blue                     | Percent    | M | R W E |
|                                                      | White                    | Percent    | O | R W E |
| de.gira.schema.channels.DimmerWhite                  | OnOff                    | Binary     | M | R W E |
|                                                      | Brightness               | Percent    | O | R W E |
|                                                      | Color-Temperature        | Float      | M | R W E |
| de.gira.schema.channels.BlindWithPos                 | Step-Up-Down             | Binary     | M | - W - |
|                                                      | Up-Down                  | Binary     | M | - W - |
|                                                      | Movement                 | Binary     | O | R - E |
|                                                      | Position                 | Percent    | O | R W E |
|                                                      | Slat-Position            | Percent    | O | R W E |
| de.gira.schema.channels.Trigger                      | Trigger                  | Binary     | M | - W E |
| de.gira.schema.channels.SceneSet                     | Execute                  | Integer    | M | - W E |
|                                                      | Teach                    | Integer    | O | - W E |
| de.gira.schema.channels.SceneControl                 | Scene                    | Integer    | M | - W - |
| de.gira.schema.channels.RoomTemperatureSwitchable    | Current                  | Float      | M | R - E |
|                                                      | Set-Point                | Float      | M | R W E |
|                                                      | OnOff                    | Binary     | O | R W E |
| de.gira.schema.channels.KNX.HeatingCoolingSwitchable | Current                  | Float      | M | R - E |
|                                                      | Set-Point                | Float      | M | R W E |
|                                                      | Mode                     | Byte       | O | - W E |
|                                                      | Status                   | Byte       | O | R - E |
|                                                      | Presence                 | Binary     | O | R W E |
|                                                      | Heating                  | Binary     | O | R - E |
|                                                      | Cooling                  | Binary     | O | R - E |
|                                                      | Heat-Cool                | Binary     | O | R W E |
|                                                      | OnOff                    | Binary     | O | R W E |
| de.gira.schema.channels.KNX.FanCoil                  | Current                  | Float      | M | R - E |
|                                                      | Set-Point                | Float      | M | R W E |
|                                                      | OnOff                    | Binary     | M | R W E |
|                                                      | Mode                     | Byte       | M | R W E |
|                                                      | Fan-Speed                | Byte       | O | R W E |
|                                                      | Vanes-UpDown-Level       | Byte       | O | R W E |
|                                                      | Vanes-UpDown-StopMove    | Binary     | O | R W E |
|                                                      | Vanes-LeftRight-Level    | Byte       | O | R W E |
|                                                      | Vanes-LeftRight-StopMove | Binary     | O | R W E |
|                                                      | Error                    | Binary     | O | R - E |
|                                                      | Error-Text               | String     | O | R - E |
| de.gira.schema.channels.AudioWithPlaylist            | Play                     | Binary     | M | R W E |
|                                                      | Volume                   | Percent    | M | R W E |
|                                                      | Mute                     | Binary     | O | R W E |
|                                                      | Previous                 | Binary     | O | - W E |
|                                                      | Next                     | Binary     | O | - W E |
|                                                      | Title                    | String     | O | R - E |
|                                                      | Album                    | String     | O | R - E |
|                                                      | Artist                   | String     | O | R - E |
|                                                      | Playlist                 | Byte       | O | R W E |
|                                                      | PreviousPlaylist         | Binary     | O | - W E |
|                                                      | NextPlaylist             | Binary     | O | - W E |
|                                                      | PlaylistName             | String     | O | R - E |
|                                                      | Shuffle                  | Binary     | O | - W E |
|                                                      | Repeat                   | Binary     | O | - W E |
| de.gira.schema.channels.Sonos.Audio                  | Play                     | Binary     | M | R W E |
|                                                      | Volume                   | Percent    | M | R W E |
|                                                      | Mute                     | Binary     | O | R W E |
|                                                      | Previous                 | Binary     | O | - W E |
|                                                      | Next                     | Binary     | O | - W E |
|                                                      | Title                    | String     | O | R - E |
|                                                      | Album                    | String     | O | R - E |
|                                                      | Artist                   | String     | O | R - E |
|                                                      | Playlist                 | Byte       | O | R W E |
|                                                      | PreviousPlaylist         | Binary     | O | - W E |
|                                                      | NextPlaylist             | Binary     | O | - W E |
|                                                      | PlaylistName             | String     | O | R - E |
|                                                      | Shuffle                  | Binary     | O | - W E |
|                                                      | Repeat                   | Binary     | O | - W E |
|                                                      | Shift-Volume             | Percentage | O | - W - |
|                                                      | Playlists                | String     | O | R - E |
|                                                      | Cover                    | String     | O | R - E |
|                                                      | ValidPlayModes           | String     | O | R - E |
|                                                      | TransportActions         | String     | O | R - E |
|                                                      | ZoneName                 | String     | O | R - E |
| de.gira.schema.channels.Camera                       | Camera                   | Binary     | M | R W E |
| de.gira.schema.channels.Link                         | Link                     | Binary     | M | R W E |
| de.gira.schema.channels.Binary                       | Binary                   | Binary     | M | R W E |
| de.gira.schema.channels.DWord                        | DWord                    | DWord      | M | R W E |
| de.gira.schema.channels.Integer                      | Integer                  | Integer    | M | R W E |
| de.gira.schema.channels.Float                        | Float                    | Float      | M | R W E |
| de.gira.schema.channels.String                       | String                   | String     | M | R W E |
| de.gira.schema.channels.Byte                         | Byte                     | Byte       | M | R W E |
| de.gira.schema.channels.Percent                      | Percent                  | Percent    | M | R W E |
| de.gira.schema.channels.Temperatur                   | Temperature              | Float      | M | R W E |
