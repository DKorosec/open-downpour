# open-downpour
> work in progress!!!

Idea:
1. Connect raspberry to the internet and external HDD which is plugged into tv or on internal shared network.
2. Use mobile / web app to download movies over torrent trackers or search the downloaded ones
3. Watch it on TV



## Hardware:
- raspberry or anything good enough to run as a simple server with internet access
- External HDD to store data on
- ... ?

## OS:
- linux
- probably best to be shipped in docker container, so it can also be ran on windows server.
- ... ?

## Backend:
- support adapter constructs for torrent trackers that will allow incremental integration 
  * can query for content over multiple torrent indices or over specific one
  * some kind of meta info, which is kinda generic (title, description, images, rating)
    * depends on parser
- provide realtime feedback of the torrent state (download progress, ...)
- query over downloaded files
- queue up downloads or parallel torrent download
- enable / disable seeding
- delete files
- ... ?


## Frontend:
  * mobile and web app
    * same features for both
  * ability to search for content 
  * nice UI so the user can search, preview and download content and see the "state" of the system (what's downloading and how long till the finish, free disk space,...)
  * ability to configure and manage the server ( see backend points )
  * ... ?
