# UNIVERSAL INFO DISPLAY PROTOTYPE

<img width="430" alt="concept" src="https://user-images.githubusercontent.com/26150152/179231190-2058acd2-1232-4a59-8467-d11a9fe26417.png">

### Version 1 (Mobile)
- A horizontally scrolled content display system. It's purpose is to display and navigate sets of item data. Location and map features included. UI Components are used to filter and sort item data.
- Display nearest _x_ items less than _x_ miles (50 default) from device location

### Goals

- Experiment navigating a simplified horizontally-scrolled content system
- Experiment enhanced content media presentation with rotating 3D effect items
- Experiment using a real industry-level dataset (100k+ items, 2500+ stores)
- Experiment map integration for items with [openstreetmap](https://openstreetmap.org)

### Demo

- [Universal Info Display Demo (mobile)](https://unidisplay.vercel.app/)

### Install/Run

(view using browser dev tools mobile)

```
npm i
npm start
```

### Design/Parts

<img width="550" alt="design" src="https://user-images.githubusercontent.com/26150152/212583444-668abfee-53ce-42e2-b4f8-c41610325006.png">

- [ContentSlider](https://github.com/tboie/universal_info_display/blob/groups/src/parts/ContentSlider.tsx): A scrolling window displaying information
- [FilterBar](https://github.com/tboie/universal_info_display/blob/groups/src/parts/FilterBar.tsx): Displays UI data filter buttons
- [Grid](https://github.com/tboie/universal_info_display/blob/groups/src/parts/Grid.tsx): A 9 unit flex grid displaying items
- [Item](https://github.com/tboie/universal_info_display/blob/groups/src/parts/Item.tsx): A modal of the selected item
- [Map](https://github.com/tboie/universal_info_display/blob/groups/src/parts/Map.tsx): An openstreetmap called rlayers to display item locations
- [Range](https://github.com/tboie/universal_info_display/blob/groups/src/parts/Range.tsx): A data asc/desc range control with the min/max auto-populated from data
- [Shell](https://github.com/tboie/universal_info_display/blob/groups/src/parts/Shell.tsx): High-level application shell containing UI components
- [Slider](https://github.com/tboie/universal_info_display/blob/groups/src/parts/Slider.tsx): A horizontally scrolled data-driven choice component
- [TitleBar](https://github.com/tboie/universal_info_display/blob/groups/src/parts/TitleBar.tsx): Status bar at the top displaying status info

### UX Flow

<img width="374" alt="ux flow" src="https://user-images.githubusercontent.com/26150152/213332519-60bd120d-31c5-4023-82bb-c8cf4f63cc59.png">

### Data Flow (design open to change)

<img width="430" alt="data flow" src="https://user-images.githubusercontent.com/26150152/210685832-fc334258-00c3-4a8e-a3f2-af6e358e3b90.png">

### Data Config

- items are stored by address(store) in arrays `[location store address].json` in [public/data/groups](https://github.com/tboie/universal_info_display/tree/main/public/data/groups)
- a group is a dataset of items [(flower example in public/data/groups/flower)](https://github.com/tboie/universal_info_display/tree/main/public/data/groups/flower)
- [/public/data/keys](https://github.com/tboie/universal_info_display/tree/main/public/data/keys) are used to link location to item files
- [/src/parts/config](https://github.com/tboie/universal_info_display/tree/main/src/parts/config) directory used for item field UI configuration
- [groups.json](https://github.com/tboie/universal_info_display/tree/main/src/parts/config/groups.json) - group UI filter name/field/alias config
- [filter_defaults.json](https://github.com/tboie/universal_info_display/tree/main/src/parts/config/filter_defaults.json) - default group filter values
- [item_aliases.json](https://github.com/tboie/universal_info_display/tree/main/src/parts/config/item_aliases.json) - item field aliases
- [template_group.json](https://github.com/tboie/universal_info_display/tree/main/src/parts/config/template_group.json) - grid group template (1st screen)
- [template_item.json](https://github.com/tboie/universal_info_display/tree/main/src/parts/config/template_item.json) - grid item template

### Performance

- Items are proximity-rendered from currently selected(viewed) page

### Equipment/Info/Tools used for 3D Item object recording with iPhone

- [iPhone Camera recorded video in square 1:1 format](https://jilaxzone.com/2021/11/23/heres-how-to-record-square-video-on-iphone-instead-of-default-169-no-3rd-party-app-installation-required/)
- [3D Printed Phone Stand](https://www.tinkercad.com/things/c7iPako4ej5-phone-stand) [[.stl file]](https://github.com/tboie/universal_info_display/blob/groups/public/3d/phone-stand.stl)
- [Arduino Uno](https://store-usa.arduino.cc/products/arduino-uno-rev3) [[arduino stepper code file]](https://github.com/tboie/universal_info_display/blob/groups/public/arduino/stepper_onerev_28BYJ-48.ino)
- [Stepper Motor 28BYJ-48](https://create.arduino.cc/projecthub/debanshudas23/getting-started-with-stepper-motor-28byj-48-3de8c9)
- [3D Printed Flower Pin Nozzle](https://www.tinkercad.com/things/0bvBJ69fsWk-needle-piece) [[.stl file]](https://github.com/tboie/universal_info_display/blob/groups/public/3d/needle-piece.stl)
- [Flower Pins](https://www.walmart.com/ip/Dritz-Flat-Flower-Pin-100-Pack/51236523)
- [Rubber Bumpers for noise reduction](https://www.walmart.com/ip/Clear-Adhesive-Bumper-Pads-106-PC-Combo-Pack-Round-Spherical-Square-Made-USA-Sound-Dampening-Transparent-Rubber-Feet-Cabinet-Doors-Drawers-Glass-Tops/762207313)
- [ffmpeg](https://ffmpeg.org) video conversion
- [backgroundremover](https://github.com/nadermx/backgroundremover) video background removal

### 3D Item Object iPhone Recording and Media Transfer

- Item is rotating on stepper motor at [360 degrees per 30 seconds](https://github.com/tboie/universal_info_display/blob/groups/public/arduino/stepper_onerev_28BYJ-48.ino)
- Place the phone on stand then [record a square video of object for 1 rotation (30 sec)](https://jilaxzone.com/2021/11/23/heres-how-to-record-square-video-on-iphone-instead-of-default-169-no-3rd-party-app-installation-required/) and rotate item on above setup
- Transfer from phone to Photos App on OS X then export (File > Export) to drive and there should now be a square .mov file.

### Video Conversion Commands

NOTE: 10 seconds is considered the official slice start time because the camera had to be re-adjusted due to slight movements after recording

1. Slice 30 seconds (1 rotation) and create new keyframes from video starting at 10 seconds

```
ffmpeg -i orig.mov -ss 00:00:10 -t 00:00:30 -async 1 out.mov
```

2. Remove background of mov and export gif

```
backgroundremover -i out.mov -tg -o out2.gif
```

3. Scale gif to 200x200 and retain transparency

```
ffmpeg -i out2.gif -filter_complex "[0:v] scale=200:200:flags=lanczos,split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse" -loop 0 final.gif
```

### Media Optimization Opportunity (secret sauce?)

NOTE: Tried using the video player with webm/mp4 files and found safari/ios can only play h264 format. That format does not appear to support an alpha(transparency channel).

Have the item "float" by displaying a slice of a full rotation.

- Use CSS sprite animations
- Play in forwards then reverse

### TODO/THINK/(RE)DESIGN
- routing
- Extend map features? Directions?
- Custom ranking systems/designs...
- Social Features
- Don't forget PPU field (_points_ per unit)
- Gamifications (badges, awards, etc)
- OnlInE ShoPPing aka e-commerce
- community involvement?
- Design and Port to new framework?
