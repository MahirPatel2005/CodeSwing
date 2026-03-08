const mongoose = require('mongoose');
require('dotenv').config();
const Problem = require('./models/Problem');

const problems = [
    {
        title: "Print 1 to N",
        description: "# Print 1 to N\n\nWrite a program that prints numbers from 1 to N, one per line.\n\n### Constraints\n- 1 <= N <= 100\n\n### Sample Input\n`5`\n\n### Sample Output\n`1`\n`2`\n`3`\n`4`\n`5`",
        difficulty: "Easy",
        tags: ["loops", "math"],
        testCases: [
            { input: "5", expectedOutput: "1\n2\n3\n4\n5", isHidden: false },
            { input: "3", expectedOutput: "1\n2\n3", isHidden: false },
            { input: "10", expectedOutput: "1\n2\n3\n4\n5\n6\n7\n8\n9\n10", isHidden: true },
            { input: "1", expectedOutput: "1", isHidden: true }
        ]
    },
    {
        title: "FizzBuzz",
        description: "# FizzBuzz\n\nPrint numbers from 1 to N. \n- For multiples of 3, print 'Fizz'. \n- For multiples of 5, print 'Buzz'. \n- For multiples of both, print 'FizzBuzz'.\n\n### Constraints\n- 1 <= N <= 100\n\n### Sample Input\n`15`\n\n### Sample Output\n`1`\n`2`\n`Fizz`\n`4`\n`Buzz`\n`Fizz`\n`7`\n`8`\n`Fizz`\n`Buzz`\n`11`\n`Fizz`\n`13`\n`14`\n`FizzBuzz`",
        difficulty: "Easy",
        tags: ["loops", "conditions"],
        testCases: [
            { input: "5", expectedOutput: "1\n2\nFizz\n4\nBuzz", isHidden: false },
            { input: "15", expectedOutput: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", isHidden: false },
            { input: "3", expectedOutput: "1\n2\nFizz", isHidden: true },
            { input: "10", expectedOutput: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz", isHidden: true }
        ]
    },
    {
        title: "Reverse a String",
        description: "# Reverse a String\n\nWrite a function that reverses a given string.\n\n### Sample Input\n`hello`\n\n### Sample Output\n`olleh`",
        difficulty: "Easy",
        tags: ["strings"],
        testCases: [
            { input: "hello", expectedOutput: "olleh", isHidden: false },
            { input: "world", expectedOutput: "dlrow", isHidden: false },
            { input: "a", expectedOutput: "a", isHidden: true },
            { input: "ab", expectedOutput: "ba", isHidden: true },
            { input: "racecar", expectedOutput: "racecar", isHidden: true }
        ]
    }
];

const seedDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codeswing';
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected for seeding');

        await Problem.deleteMany({});
        console.log('Old problems deleted');

        await Problem.insertMany(problems);
        console.log('New problems inserted');

        await mongoose.disconnect();
        console.log('Database disconnected');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedDB();
