import { v4 as uuidv4 } from "uuid";

const constructFillTheBlankParametersFromKeyValuePairs = (keyValuePairs) => {
  return {
    title: keyValuePairs.find((item) => item?.parameter === "_Question_")?.text,
    options: keyValuePairs
      .filter((item) => item.parameter === "answers")
      .map((item) => ({
        id: uuidv4(),
        _Answer_: item.text,
        _Tip_: "",
       
      })),
  };
};

function hexToRgbA(hex) {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");
    return (
      "rgba(" + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") + ", 0.2)"
    );
  }
  // throw new Error("Bad Hex");
}

export { constructFillTheBlankParametersFromKeyValuePairs, hexToRgbA };
