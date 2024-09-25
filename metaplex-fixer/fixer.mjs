import * as fs from "fs";
import { globSync } from "glob";

const found = globSync("./../node_modules/@metaplex-foundation/**/*.{ts,js,cjs}");

found.forEach((file) => {
  console.log("file", file);
  const data = fs.readFileSync(file, "utf8");
  const result = data.replace(
    /@metaplex-foundation\/umi\/serializers/g,
    "@metaplex-foundation/umi-serializers",
  );

  console.log("writing", file);
  fs.writeFileSync(file, result, "utf8");
});