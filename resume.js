const fs = require("fs");
const _ = require("lodash");

const resumes = [
  "default",
  ...(process.env.RESUMES || "").split(",").filter(Boolean)
].map(r => require(`./resumes/${r}.json`));

fs.writeFileSync(
  "./resume.json",
  JSON.stringify(
    _.mergeWith(...resumes, (objValue, srcValue) => {
      if (_.isArray(objValue)) {
        return objValue.concat(srcValue);
      }
    }),
    null,
    2
  )
);
