import axios from "axios";
import { Stream } from "stream";



const token = process.env.TOKEN;
const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
const streamURL = "https://api.twitter.com/2/tweets/search/stream";

const makeRules = (keyword: String) => ({ value: keyword, tag: keyword });

export async function getAllRules() {
  const response = await axios.get(rulesURL, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
    return null;
  }
  return response.data;
}

export async function deleteRules(keyword: string) {
  let rules = await getAllRules();
  let ids: string[] = [];
  rules.data.forEach((element: any) => {
    if (element.value === keyword) {
      ids.push(element.id);
    }
  });

  const response = await axios.post(
    rulesURL,
    {
      delete: {
        ids: ids,
      },
    },
    {
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status !== 200) {
    throw new Error(response.statusText);
    return null;
  }

  return response.data;
}

async function deleteAllRules(rules: any) {
  if (!Array.isArray(rules.data)) {
    return null;
  }

  const ids = rules.data.map((rule: any) => rule.id);

  const data = {
    delete: {
      ids: ids,
    },
  };

  const response = await axios.post(rulesURL, data, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
    return null;
  }

  return response.data;
}

async function setRules(rules: string[]) {
  const add: Object[] = [];

  rules.forEach((rule) => {
    add.push(makeRules(rule));
  });

  let data = {
    add: rules,
  };

  const response = await axios.post(rulesURL, data, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 201) {
    throw new Error(response.statusText);
    return null;
  }

  return response.data;
}

export async function addRule(keyword: string) {
  let rules: any = [];
  rules.push(makeRules(keyword));

  await setRules(rules);
}

async function streamConnect() {
  const response = await axios.get(streamURL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "stream",
  });
  let stream = response.data;
  return stream;
}

let stream: Stream | undefined = undefined;

export default async function getStream() {
  const currentRules = await getAllRules();

  await deleteAllRules(currentRules);

  if (stream === undefined) {
    stream = await streamConnect();
  }

  return stream;
}
