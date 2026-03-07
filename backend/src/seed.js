const mongoose = require('mongoose');
require('dotenv').config();
const Problem = require('./models/Problem');

const problems = [
    {
        title: "Print 1 to N",
        description: "Write a program that prints numbers from 1 to N, one per line.",
        difficulty: "Easy",
        tags: ["loops", "math"],
        testCases: [
            { input: "5", expectedOutput: "1\n2\n3\n4\n5" },
            { input: "3", expectedOutput: "1\n2\n3" }
        ]
    },
    {
        title: "FizzBuzz",
        description: "Print numbers from 1 to N. For multiples of 3, print 'Fizz'. For multiples of 5, print 'Buzz'. For multiples of both, print 'FizzBuzz'.",
        difficulty: "Easy",
        tags: ["loops", "conditions"],
        testCases: [
            { input: "5", expectedOutput: "1\n2\nFizz\n4\nBuzz" },
            { input: "15", expectedOutput: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz" }
        ]
    },
    {
        title: "Reverse a String",
        description: "Write a function that reverses a given string.",
        difficulty: "Easy",
        tags: ["strings"],
        testCases: [
            { input: "hello", expectedOutput: "olleh" },
            { input: "world", expectedOutput: "dlrow" }
        ]
    },
    {
        title: "Sum of Array",
        description: "Given a list of numbers separated by space, find their sum.",
        difficulty: "Easy",
        tags: ["arrays", "math"],
        testCases: [
            { input: "1 2 3", expectedOutput: "6" },
            { input: "-1 1 5", expectedOutput: "5" }
        ]
    },
    {
        title: "Check Palindrome",
        description: "Check if a given string is a palindrome. Output 'true' or 'false'.",
        difficulty: "Medium",
        tags: ["strings", "conditions"],
        testCases: [
            { input: "racecar", expectedOutput: "true" },
            { input: "hello", expectedOutput: "false" }
        ]
    },
    {
        title: "Count Vowels",
        description: "Count the number of vowels (a, e, i, o, u) in a given string.",
        difficulty: "Easy",
        tags: ["strings", "loops"],
        testCases: [
            { input: "hello", expectedOutput: "2" },
            { input: "world", expectedOutput: "1" }
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
