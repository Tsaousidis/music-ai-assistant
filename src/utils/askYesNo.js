import readline from "readline";

export function askYesNo(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      const normalized = String(answer || "").trim().toLowerCase();
      resolve(normalized === "y" || normalized === "yes");
    });
  });
}