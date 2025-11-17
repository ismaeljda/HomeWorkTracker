import { collection, doc, setDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Homework } from '../firebase/firestore';

// Helper to create dates starting from tomorrow
const getTomorrowPlusDays = (daysToAdd: number): Timestamp => {
  const date = new Date();
  date.setDate(date.getDate() + 1 + daysToAdd); // Start from tomorrow
  date.setHours(23, 59, 0, 0); // Set to end of day
  return Timestamp.fromDate(date);
};

export const addMathHomeworks = async () => {
  console.log('📐 Starting to add detailed math homework assignments...');

  try {
    // Get Mathematics subject
    const subjectsSnap = await getDocs(collection(db, 'subjects'));
    const mathSubject = subjectsSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .find((s: any) => s.name === 'Mathematics');

    if (!mathSubject) {
      console.error('❌ Mathematics subject not found!');
      return { success: false, message: 'Mathematics subject not found' };
    }

    const mathSubjectData = mathSubject as any;

    // Initialize student completions
    const studentCompletions: { [key: string]: boolean } = {};
    mathSubjectData.studentIds.forEach((studentId: string) => {
      studentCompletions[studentId] = false;
    });

    // Create 5 detailed math homeworks (one for each day starting tomorrow)
    const mathHomeworks = [
      {
        title: 'Algebra - Linear Equations and Inequalities',
        description: `**Chapter 5: Linear Equations and Inequalities**

**Part 1: Solving Linear Equations (30 points)**
Solve the following equations and verify your solutions:
1. 3x + 7 = 22
2. 5(2x - 3) = 4x + 9
3. (x/4) + 6 = 10
4. 2(3x + 1) - 5 = 3(x - 2) + 8
5. 0.5x + 0.3(x - 2) = 1.4

**Part 2: Word Problems (40 points)**
6. A rectangle has a length that is 5 cm more than twice its width. If the perimeter is 64 cm, find the dimensions.
7. Sarah has $2.50 in nickels and dimes. She has 5 more dimes than nickels. How many of each coin does she have?
8. The sum of three consecutive integers is 72. Find the integers.
9. A train travels 180 km in 3 hours. At this rate, how far will it travel in 5.5 hours?

**Part 3: Inequalities (30 points)**
Solve and graph the following inequalities:
10. 2x - 5 > 9
11. -3x + 7 ≤ 16
12. 5 ≤ 2x + 1 < 13
13. |x - 3| ≥ 5

**Submission Instructions:**
- Show all your work for full credit
- Include verification for equations
- Draw clear number line graphs for inequalities
- Box or circle your final answers`,
        daysFromTomorrow: 0 // Tomorrow
      },
      {
        title: 'Geometry - Triangles and Quadrilaterals',
        description: `**Chapter 7: Triangles and Quadrilaterals**

**Part 1: Triangle Properties (25 points)**
1. In triangle ABC, angle A = 65° and angle B = 48°. Find angle C.
2. Prove that the sum of angles in any triangle equals 180°.
3. A triangle has sides of 5 cm, 7 cm, and 9 cm. Is it a right triangle? Explain using the Pythagorean theorem.
4. Find the area of an equilateral triangle with side length 8 cm.
5. The angles of a triangle are in the ratio 2:3:4. Find each angle.

**Part 2: Special Triangles (25 points)**
6. In a 30-60-90 triangle, if the shortest side is 6 cm, find the other two sides.
7. An isosceles right triangle has legs of length 10 cm. Find the hypotenuse.
8. Find the missing sides in a 45-45-90 triangle where the hypotenuse is 12√2 cm.

**Part 3: Quadrilaterals (30 points)**
9. A parallelogram has adjacent sides of 8 cm and 12 cm with an angle of 60° between them. Find its area.
10. The diagonals of a rhombus are 16 cm and 12 cm. Find the area and the length of each side.
11. A trapezoid has parallel sides of 10 cm and 18 cm, with a height of 8 cm. Find its area.

**Part 4: Challenge Problems (20 points)**
12. In rectangle ABCD, the diagonal AC = 13 cm and side AB = 5 cm. Find BC and the area.
13. Prove that the diagonals of a parallelogram bisect each other.

**Submission Instructions:**
- Include diagrams for all problems
- Show all calculations step by step
- Use proper geometric notation and symbols`,
        daysFromTomorrow: 1 // Day after tomorrow
      },
      {
        title: 'Calculus - Derivatives and Applications',
        description: `**Chapter 11: Introduction to Derivatives**

**Part 1: Basic Derivatives (30 points)**
Find the derivative of each function:
1. f(x) = 5x³ - 2x² + 7x - 3
2. g(x) = (2x + 1)(3x - 4)
3. h(x) = (x² + 1)/(x - 2)
4. k(x) = √(4x + 5)
5. m(x) = (3x² - 1)⁴
6. n(x) = sin(2x) + cos(x²)

**Part 2: Applications - Rates of Change (25 points)**
7. A ball is thrown upward with position function s(t) = -4.9t² + 20t + 2 (meters). Find:
   a) The velocity function v(t)
   b) The velocity at t = 2 seconds
   c) When the ball reaches its maximum height

8. The radius of a circular oil spill is increasing at 5 m/min. How fast is the area increasing when the radius is 20 meters?

**Part 3: Tangent Lines and Critical Points (25 points)**
9. Find the equation of the tangent line to y = x³ - 3x + 2 at x = 1.
10. Find all critical points of f(x) = x³ - 6x² + 9x + 1 and classify them as maxima or minima.
11. Determine where the function g(x) = 2x³ - 9x² + 12x is increasing and decreasing.

**Part 4: Optimization Problems (20 points)**
12. A farmer has 200 meters of fencing to enclose a rectangular field. What dimensions maximize the area?
13. A box with a square base and no top is to have a volume of 500 cm³. Find the dimensions that minimize the surface area.

**Submission Instructions:**
- Show all derivative calculations using proper notation
- Include units in word problems
- Sketch graphs where appropriate
- Verify critical points using the second derivative test`,
        daysFromTomorrow: 2
      },
      {
        title: 'Probability and Statistics - Data Analysis',
        description: `**Chapter 9: Probability and Statistical Analysis**

**Part 1: Descriptive Statistics (25 points)**
Given the dataset: 12, 15, 18, 15, 22, 19, 15, 20, 24, 18, 15, 21
Calculate:
1. Mean
2. Median
3. Mode
4. Range
5. Standard deviation
6. Create a frequency table
7. Draw a histogram with appropriate bins

**Part 2: Probability Basics (25 points)**
8. A bag contains 5 red, 3 blue, and 7 green marbles. Find the probability of:
   a) Drawing a red marble
   b) Drawing a blue or green marble
   c) Drawing two red marbles without replacement
   d) Drawing at least one blue marble in two draws with replacement

9. Two dice are rolled. What is the probability that:
   a) The sum is 7?
   b) The sum is greater than 9?
   c) At least one die shows a 6?

**Part 3: Combinations and Permutations (25 points)**
10. How many ways can 5 students be arranged in a row for a photo?
11. A committee of 4 people is to be chosen from 10 candidates. How many different committees are possible?
12. How many 4-digit codes can be formed using digits 0-9 if:
    a) Repetition is allowed?
    b) Repetition is not allowed?
    c) The code must start with an odd digit and repetition is not allowed?

**Part 4: Applied Statistics (25 points)**
13. A survey of 200 students showed that 120 like pizza, 90 like burgers, and 50 like both. Create a Venn diagram and find:
    a) How many like only pizza?
    b) How many like only burgers?
    c) How many like neither?

14. The average score on a test is 75 with a standard deviation of 8. Assuming a normal distribution:
    a) What percentage of scores fall between 67 and 83?
    b) What score represents the 84th percentile?

**Submission Instructions:**
- Show all calculations with formulas
- Include properly labeled diagrams and graphs
- Round probabilities to 4 decimal places
- Use proper statistical notation`,
        daysFromTomorrow: 3
      },
      {
        title: 'Functions and Graphs - Comprehensive Review',
        description: `**Chapter 6: Functions, Transformations, and Analysis**

**Part 1: Function Basics (20 points)**
1. Determine if the following relations are functions (explain why or why not):
   a) {(1,2), (2,3), (3,4), (1,5)}
   b) y² = x
   c) y = |x - 3|

2. For f(x) = 2x² - 5x + 3, find:
   a) f(-2)
   b) f(a + 1)
   c) f(x + h) - f(x)

**Part 2: Domain and Range (20 points)**
Find the domain and range for each function:
3. f(x) = √(x - 4)
4. g(x) = 1/(x² - 9)
5. h(x) = |2x + 1| - 3
6. k(x) = log₂(x + 5)

**Part 3: Function Transformations (25 points)**
7. Starting with f(x) = x², describe the transformations and sketch:
   a) g(x) = 2(x - 3)² + 1
   b) h(x) = -(x + 2)² - 4

8. The graph of y = f(x) passes through (2, 5). Find the corresponding point on:
   a) y = f(x - 3)
   b) y = 2f(x)
   c) y = f(-x)
   d) y = -f(x) + 4

**Part 4: Composite and Inverse Functions (20 points)**
9. If f(x) = 2x + 1 and g(x) = x² - 3, find:
   a) (f ∘ g)(x)
   b) (g ∘ f)(x)
   c) (f ∘ g)(2)

10. Find the inverse function f⁻¹(x) for:
    a) f(x) = 3x - 7
    b) f(x) = (x + 2)/(x - 1)

**Part 5: Graphing and Analysis (15 points)**
11. Graph the piecewise function and find its domain and range:
    f(x) = { x + 2,    if x < -1
           { x²,       if -1 ≤ x ≤ 2
           { 2x - 3,   if x > 2

12. For f(x) = x³ - 4x, find:
    a) x-intercepts
    b) y-intercept
    c) End behavior
    d) Sketch the graph

**Submission Instructions:**
- Include all graphs on graph paper or digital graphing tool
- Label all key points, asymptotes, and intercepts
- Show algebraic work for all calculations
- Use arrow notation for end behavior`,
        daysFromTomorrow: 4
      }
    ];

    let count = 0;
    for (let i = 0; i < mathHomeworks.length; i++) {
      const hw = mathHomeworks[i];
      const homeworkId = `math_hw_detailed_${i + 1}`;

      const homework: Omit<Homework, 'id'> = {
        title: hw.title,
        type: 'homework',
        subjectId: mathSubjectData.id,
        teacherId: mathSubjectData.teacherId,
        description: hw.description,
        deadline: getTomorrowPlusDays(hw.daysFromTomorrow),
        studentCompletions,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        locationType: 'online'
      };

      await setDoc(doc(db, 'homeworks', homeworkId), homework);
      count++;

      const deadlineDate = homework.deadline.toDate();
      console.log(`✅ Created: ${homework.title}`);
      console.log(`   Due: ${deadlineDate.toLocaleDateString()} at ${deadlineDate.toLocaleTimeString()}`);
    }

    console.log('\n✨ Math homework creation complete!\n');
    console.log('📋 Summary:');
    console.log(`   - Created ${count} detailed math assignments`);
    console.log(`   - Covering topics: Algebra, Geometry, Calculus, Statistics, Functions`);
    console.log(`   - One assignment due each day for the next 5 days`);

    return {
      success: true,
      message: 'Math homeworks created successfully!',
      count
    };
  } catch (error: any) {
    console.error('❌ Error:', error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
};
