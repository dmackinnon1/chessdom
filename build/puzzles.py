# mathematical chess puzzles
# This script will output a set of mathematical chess puzzles in json format
# for use with an interactive solver

import os
# 1. generic json functions
def att(name, value):
    result = "\""+ name +"\": "
    if (isinstance(value, int)):
        result += str(value)
    elif (value[0] == '['):
        result += str(value)
    else:
        result += "\"" + str(value) + "\""
    return result

def json(attributes):
    result = "{"
    first = True
    for pair in attributes:
        if not first:
            result += ", "
        first = False
        result += pair
    result += "}"
    return result

def jarr(items):
    result = "["
    first = True
    for pair in items:
        if not first:
            result += ", "
        first = False
        result += pair
    result += "]"
    return result

def bigjarr(jsons):
    result = "[" 
    first = True
    for js in jsons:
        if not first:
            result += ","
            result += "\n"
        first = False
        result += "\t"
        result += js
    result += "\n]"
    return result;

# 2. puzzle-json specific functions
def piece(name, count):
    return json([att("name", name), att("count", count)])


def puzzle(name, size, cover, unguard, pieces):
    return json([
        att("name",name), 
        att("size",size), 
        att("cover", cover), 
        att("unguard", unguard),
        att("pieces", jarr(pieces))
    ])
 
# 3. defining specific puzzles
puzzles = []
puzzles.append(puzzle("5 queens on 5x5", 5, "true", "true", [piece("queen",5)]))
puzzles.append(puzzle("5 queens on 8x8", 8, "true", "true", [piece("queen",5)]))
puzzles.append(puzzle("5 knights on 5x5", 5, "true", "true", [piece("knight",5)]))
puzzles.append(puzzle("12 knights on 8x8", 5, "true", "false", [piece("knight",8)]))


# 4. printing puzzle file
print('-------------------------------------------')
print('Generating Chess Puzzle Data.')
print(' --- creating file ../data/puzzles.json')
directory = "../data"
if not os.path.exists(directory):
    os.makedirs(directory)
f = open(directory + "/puzzles.json","w")
f.write(bigjarr(puzzles))
f.close()
print(' --- done')
f.close()
