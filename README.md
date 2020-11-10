# twitter-stream-service

<img src="twitter.png" alt="twitter" width="200"/>

A micro-service for consuming the [Twitter streaming API](https://developer.twitter.com/en/docs/tutorials/stream-tweets-in-real-time).

## Usage

Set the `TOKEN` environment variable to your Twitter API key. Then the service can be run with Docker.

`docker build . -t twitter-stream-service`


`docker run -i -t -p 8080:8080 twitter-stream-service`