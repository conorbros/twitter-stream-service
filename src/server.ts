import * as http from "http";
import * as fs from "fs";
import getStream, { getAllRules, addRule, deleteRules } from "./stream";
import { Stream } from "stream";

let stream: Stream;
(async () => {
  stream = await getStream();
  console.log("Stream ready.");
})();

const rules: Map<string, number> = new Map<string, number>();

async function parseBody(request: any) {
  let body: any = [];
  return new Promise((resolve) => {
    request
      .on("data", (chunk: string) => {
        body.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(body).toString();
        resolve(body);
      });
  });
}

http
  .createServer(async function (request: any, response: any) {
    if (request.url === "/test") {
      response.statusCode = 200;
      response.write("hello");
      response.end();
    }

    if (request.url === "/add" && request.method === "POST") {
      const body: any = await parseBody(request);
      const keyword = JSON.parse(body).keyword;

      if (rules.has(keyword)) {
        rules.set(keyword, rules.get(keyword) + 1);
      } else {
        rules.set(keyword, 1);
        await addRule(keyword);
      }

      console.log("add ", keyword);

      let usersSubbed = rules.get(keyword);

      response.statusCode = 200;
      response.write(JSON.stringify({ usersSubbed: usersSubbed }));
      response.end();
      return;
    }

    if (request.url === "/remove" && request.method === "POST") {
      const body: any = await parseBody(request);
      const keyword = JSON.parse(body).keyword;

      console.log("removed ", keyword);

      let usersSubbed = 0;

      if (rules.get(keyword) > 1) {
        rules.set(keyword, rules.get(keyword) - 1);
        usersSubbed = rules.get(keyword);
      } else {
        rules.delete(keyword);
        await deleteRules(keyword);
      }

      response.statusCode = 200;
      response.write(JSON.stringify({ usersSubbed: usersSubbed }));
      response.end();
      return;
    }

    stream.pipe(response);
  })
  .listen(8080);

console.log("Server listening on 8080");
