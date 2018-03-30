# chessdom
Please try out the live example [here](https://dmackinnon1.github.io/chessdom/). Pages in this repo are intended to help explore the mathematical chess concepts of *domination* (*covering*) and *independence* (*unguarding*). In the mathematical chess problem of domination, you are tasked with finding an arrangement of several pieces of the same type so that every square on the board is reachable in a single move by at least one of the pieces. In the problem of independence, your goal is to place the maximum number of pieces of the same type so that none of the pieces lie in the path of another.

On the [Explorer](https://dmackinnon1.github.io/chessdom/) page, you can experiment by placing pieces on boards of different sizes. When using this page, you are not restricted to use only pieces of the same type.

![explorer example](https://raw.githubusercontent.com/dmackinnon1/chessdom/master/imgs/explorer_example.png)

On the [Puzzles](https://dmackinnon1.github.io/chessdom/puzzles.html) page, you can attempt to solve a number of mathematical chess puzzles involving domination and independence. For example:

![explorer example](https://raw.githubusercontent.com/dmackinnon1/chessdom/master/imgs/example_puzzle.png)

## puzzles 

Information on mathematical chess puzzles can be obtained from many sources online. My primary source was John J. Watkins book *Across the Board* (2004, Princeton University Press).

Puzzle definitions are generated by running the **puzzles.py** Python script in the **build** directory.

```
[chessdom/build]$ python puzzles.py 
-------------------------------------------
Generating Chess Puzzle Data.
 --- creating file ../data/puzzles.json
 --- done
```
This script generates the **puzzles.json** script, which contains puzzles in this format:

```javascript
{
  "name": "8 queens on 8x8",
  "size": 8,
  "cover": "true",
  "unguard": "true",
  "pieces": [
    {
      "name": "queen",
      "count": 8
    }
  ]
}
````

The puzzle above is the classic "8 queens" problem, one of the more difficult problems in the set.
