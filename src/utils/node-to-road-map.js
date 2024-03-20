// nodeToRoadMap is an object in which the outter key represents the starting node, and each internal
// key represents a potential ending node. the value linked to the interal keys is the road number
// that should be switched on based on the start and end node selection because it sits between
// the outer key and the inner key


// need to come up with a number system that avoids duplicates and then when trying to 
// determine which road needs to be switched on do something like pick the road with the lower
// number and use that to key into the other key. maybe just do even numbers

const nodeToRoadMap = {
  0: {
    29: 0,
    1: 1
  },

  1: {
    0: 1,
    2: 2,
    30: 70
  },

  2: {
    1: 2,
    3: 3,
  },

  3: {
    2: 3,
    4: 4,
    32: 71
  },

  4: {
    3: 4,
    5: 5,
  },

  5: {
    4: 5,
    6: 6,
  },

  6: {
    5: 6,
    7: 7,
    33: 35
  },

  7: {
    6: 7,
    8: 8,
  },

  8: {
    7: 8,
    9: 9,
    35: 46
  },

  9: {
    8: 9,
    10: 10,
  },

  10: {
    9: 10,
    11: 11,
  },

  11: {
    10: 11,
    12: 12,
    36: 58
  },

  12: {
    11: 12,
    13: 13
  },

  13: {
    12: 13,
    14: 14,
    38: 67
  },

  14: {
    13: 14,
    15: 15,
  },

  15: {
    14: 15,
    16: 16,
  },

  16: {
    15: 16,
    17: 17,
    39: 69
  },

  17: {
    16: 17,
    18: 18,
  },

  18: {
    17: 18,
    19: 19,
    41: 68
  },

  19: {
    18: 19,
    20: 20,
  },

  20: {
    21: 21,
    19: 20,
  },

  21: {
    20: 21,
    22: 22,
    42: 62
  },

  22: {
    21: 22,
    23: 23,
  },

  23: {
    22: 23,
    24: 24,
    44: 51
  },

  24: {
    23: 24,
    25: 25,
  },

  25: {
    26: 26,
    24: 25,
  },

  26: {
    25: 26,
    27: 27,
    45: 39
  },

  27: {
    26: 27,
    28: 28,
  },

  28: {
    29: 29,
    27: 28,
    47: 30
  },

  29: {
    0: 0,
    28: 29,
  },

  30: {
    47: 31,
    31: 32,
    1: 70
  },

  31: {
    30: 32,
    32: 33,
    48: 37
  },

  32: {
    31: 33,
    33: 34,
    3: 71
  },

  33: {
    32: 34,
    6: 35,
    34: 38
  },

  34: {
    33: 38,
    35: 45,
    49: 44
  },

  35: {
    34: 45,
    8: 46,
    36: 50
  },

  36: {
    37: 57,
    11: 58,
    35: 50
  },

  37: {
    50: 56,
    36: 57,
    38: 61
  },

  38: {
    37: 61,
    39: 66,
    13: 67
  },

  39: {
    38: 66,
    40: 65,
    16: 69
  },

  40: {
    39: 65,
    41: 64,
    51: 60
  },

  41: {
    40: 64,
    42: 63,
    18: 68
  },

  42: {
    41: 63,
    43: 59,
    21: 62
  },

  43: {
    52: 53,
    44: 52,
    42: 59
  },

  44: {
    43: 52,
    45: 47,
    23: 51
  },

  45: {
    46: 40,
    44: 47,
    26: 39
  },

  46: {
    45: 40,
    53: 41,
    47: 36
  },

  47: {
    46: 36,
    30: 31,
    28: 30
  },

  48: {
    31: 37,
    49: 43,
    53: 42
  },

  49: {
    34: 44,
    50: 49,
    48: 43
  },

  50: {
    49: 49,
    51: 55,
    37: 56
  },

  51: {
    40: 60,
    52: 54,
    50: 55
  },

  52: {
    53: 48,
    51: 54,
    43: 53
  },

  53: {
    46: 41,
    48: 42,
    52: 48
  },
}

export default nodeToRoadMap;