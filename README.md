## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Task 1

Task 1 logic is located in `src/modules/logic.ts`.
It is called to run simulation for Task 2a. 

It can be tested without frontend via the following command:
`npx ts-node src/modules/main.ts`

### Bonus question

The concurrency factor seems to drop when the number of chargepoints increase.

### Hypothesis and limits
- Intervals are split into quarters. A car stops charging at the end of a quarter.
Hence, energy used to charge cars is rounded up. 


## Task 2a
The frontend is made with React, Tailwind and CSS stylesheets.
You can manipulate the 4 inputs and the outputs will update accordingly.
