interface Greeter {
  greet(name: string): string;
}

class EnglishGreeter implements Greeter {
  greet(name: string): string {
    return `Hello, ${name}`;
  }
}

const greeter: Greeter = new EnglishGreeter();

console.log(greeter.greet("Abhay"));
