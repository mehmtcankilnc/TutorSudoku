import { Technique } from '../types';

export const TECHNIQUES: Technique[] = [
  {
    id: '1',
    title: 'Naked Single',
    difficulty: 'Beginner',
    description:
      'When a cell has only one possible candidate remaining, that number implies the solution for that cell.',
    example:
      'If a cell can only be "5" because 1-4 and 6-9 are already in the row, col, or box, fill it in!',
  },
  {
    id: '2',
    title: 'Hidden Single',
    difficulty: 'Beginner',
    description:
      'When a number can only go in one specific cell within a row, column, or box, even if that cell has other candidates.',
    example:
      'In a 3x3 box, if the number "7" can only be placed in the top-right cell (because other cells are blocked), it must go there.',
  },
  {
    id: '3',
    title: 'Locked Candidates (Pointing)',
    difficulty: 'Intermediate',
    description:
      'If a candidate number is restricted to a single row or column within a 3x3 box, you can eliminate that number from the rest of that row or column outside the box.',
    example:
      'If "3"s in Box 1 are only in the top row, then no other cell in the top row (in Box 2 or 3) can be a 3.',
  },
  {
    id: '4',
    title: 'Naked Pairs',
    difficulty: 'Intermediate',
    description:
      'If two cells in a unit (row/col/box) contain exactly the same two candidates (e.g., 2 & 7), those numbers must be in those two cells. You can remove them from all other cells in that unit.',
    example:
      'Cells A1 and A2 both have candidates {2, 7}. No other cell in Row A can have 2 or 7.',
  },
  {
    id: '5',
    title: 'Hidden Pairs',
    difficulty: 'Intermediate',
    description:
      'If two numbers appear ONLY in two specific cells within a unit (row/col/box), they form a Hidden Pair. Even if those cells have other notes, they MUST be the pair.',
    example:
      'In a row, if "3" and "9" only appear in the 1st and 5th cells, those cells must be 3 and 9. Remove all other notes from them.',
  },
  {
    id: '6',
    title: 'Naked Triples',
    difficulty: 'Intermediate',
    description:
      'Three cells in a unit share three candidates among them (e.g., {1,2}, {2,3}, {1,3} or {1,2,3}). These three numbers must go in these three cells.',
    example:
      'In a box, three cells have notes {1,2}, {2,3}, and {1,3}. No other cell in that box can contain 1, 2, or 3.',
  },
  {
    id: '7',
    title: 'Hidden Triples',
    difficulty: 'Advanced',
    description:
      'If three numbers appear ONLY in three specific cells within a unit, they form a Hidden Triple. Those cells are reserved for these three numbers.',
    example:
      'If 4, 5, and 6 only appear in three specific cells of a column, remove all unrelated notes from those cells.',
  },
  {
    id: '8',
    title: 'X-Wing',
    difficulty: 'Advanced',
    description:
      'When a number appears in exactly two spots in two different rows, and these spots align in columns, it forms a rectangle. You can eliminate that number from the rest of the columns.',
    example:
      'If "7" is in only cols 2 and 8 for both Row A and Row C, then "7" cannot appear in cols 2 and 8 in any other row.',
  },
  {
    id: '9',
    title: 'Y-Wing (XY-Wing)',
    difficulty: 'Advanced',
    description:
      'A pivot cell connects to two "pincers". If the pivot is XY, and pincers are YZ and XZ, any cell seeing both pincers cannot contain Z.',
    example:
      'Pivot {1,2}, Pincer A {2,3}, Pincer B {1,3}. Any cell seeing both Pincer A and B cannot be "3".',
  },
  {
    id: '10',
    title: 'Swordfish',
    difficulty: 'Pro',
    description:
      'Like an X-Wing but with three rows and three columns. If a number appears in only 2-3 specific columns across three rows, it forms a pattern eliminating that number from those columns elsewhere.',
    example:
      'A "5" restricted to cols 1, 5, 9 in rows A, D, F. Eliminates "5" from cols 1, 5, 9 in all other rows.',
  },
];
