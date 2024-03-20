const gameBoard =
{
  // REFACTOR NOTE: need to pack all these nodes into a single object 
  // like the other fields below this one

  // REFACTOR NOTE: feel like there is some redundancy going on here.
  // Especially with the road_slots section. there is a roads section already.
  // and then there is the node-to-road-map. these 3 separate road relaated data
  // structures should be merged in some way. it's likely that the needed info can
  // be derived from other info without needing a whole separate data structure.
  // that's just the easier but memory/design unfriendly way of doing it
  
  "0": {
    "neighbors": [
      1,
      29
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "1": {
    "neighbors": [
      0,
      2,
      30
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "2": {
    "neighbors": [
      1,
      3
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "3": {
    "neighbors": [
      2,
      4,
      32
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true,
    "frequency": null
  },
  "4": {
    "neighbors": [
      3,
      5
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "5": {
    "neighbors": [
      4,
      6
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "6": {
    "neighbors": [
      5,
      7,
      33
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "7": {
    "neighbors": [
      6,
      8
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "8": {
    "neighbors": [
      7,
      9,
      35
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "9": {
    "neighbors": [
      8,
      10
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "10": {
    "neighbors": [
      9,
      11
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "11": {
    "neighbors": [
      10,
      12,
      36
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "12": {
    "neighbors": [
      11,
      13
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "13": {
    "neighbors": [
      12,
      14,
      38
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "14": {
    "neighbors": [
      13,
      15
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "15": {
    "neighbors": [
      14,
      16
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "16": {
    "neighbors": [
      15,
      17,
      39
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "17": {
    "neighbors": [
      16,
      18
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "18": {
    "neighbors": [
      17,
      19,
      41
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "19": {
    "neighbors": [
      18,
      20
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "20": {
    "neighbors": [
      19,
      21
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "21": {
    "neighbors": [
      20,
      22,
      42
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "22": {
    "neighbors": [
      21,
      23
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "23": {
    "neighbors": [
      22,
      24,
      44
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "24": {
    "neighbors": [
      23,
      25
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "25": {
    "neighbors": [
      24,
      26
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "26": {
    "neighbors": [
      25,
      27,
      45
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "27": {
    "neighbors": [
      26,
      28
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "28": {
    "neighbors": [
      27,
      29,
      47
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "29": {
    "neighbors": [
      28,
      0
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "30": {
    "neighbors": [
      47,
      31,
      1
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "31": {
    "neighbors": [
      30,
      32,
      48
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "32": {
    "neighbors": [
      31,
      33,
      3
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "33": {
    "neighbors": [
      32,
      34,
      6
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "34": {
    "neighbors": [
      33,
      35,
      49
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "35": {
    "neighbors": [
      34,
      36,
      8
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "36": {
    "neighbors": [
      35,
      37,
      11
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "37": {
    "neighbors": [
      36,
      38,
      50
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "38": {
    "neighbors": [
      37,
      39,
      13
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "39": {
    "neighbors": [
      38,
      40,
      16
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "40": {
    "neighbors": [
      39,
      41,
      51
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "41": {
    "neighbors": [
      40,
      42,
      18
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "42": {
    "neighbors": [
      41,
      43,
      21
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "43": {
    "neighbors": [
      42,
      44,
      52
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "44": {
    "neighbors": [
      43,
      45,
      23
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "45": {
    "neighbors": [
      44,
      46,
      26
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "46": {
    "neighbors": [
      45,
      47,
      53
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "47": {
    "neighbors": [
      30,
      46,
      28
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "48": {
    "neighbors": [
      53,
      49,
      31
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "49": {
    "neighbors": [
      50,
      48,
      34
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "50": {
    "neighbors": [
      49,
      51,
      37
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "51": {
    "neighbors": [
      50,
      52,
      40
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "52": {
    "neighbors": [
      51,
      53,
      43
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "53": {
    "neighbors": [
      52,
      48,
      46
    ],
    "structure": "",
    "root": false,
    "username": null,
    "userId": null,
    "color": null,
    "road_slots": [
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      },
      {
        "color": null,
        "connecting_node": null
      }
    ],
    "can_add_road": true
  },
  "roads": {
    // - roads keeps track of which roads are active and what color they
    // should be when they are displayed
    // - used in conjunction with the node-to-road-map to determine which
    // road should be activated depending on a selected start and end node
    "0": {'placed': '', 'color': null},
    "1": {'placed': '', 'color': null},
    "2": {'placed': '', 'color': null},
    "3": {'placed': '', 'color': null},
    "4": {'placed': '', 'color': null},
    "5": {'placed': '', 'color': null},
    "6": {'placed': '', 'color': null},
    "7": {'placed': '', 'color': null},
    "8": {'placed': '', 'color': null},
    "9": {'placed': '', 'color': null},
    "10": {'placed': '', 'color': null},
    "11": {'placed': '', 'color': null},
    "12": {'placed': '', 'color': null},
    "13": {'placed': '', 'color': null},
    "14": {'placed': '', 'color': null},
    "15": {'placed': '', 'color': null},
    "16": {'placed': '', 'color': null},
    "17": {'placed': '', 'color': null},
    "18": {'placed': '', 'color': null},
    "19": {'placed': '', 'color': null},
    "20": {'placed': '', 'color': null},
    "21": {'placed': '', 'color': null},
    "22": {'placed': '', 'color': null},
    "23": {'placed': '', 'color': null},
    "24": {'placed': '', 'color': null},
    "25": {'placed': '', 'color': null},
    "26": {'placed': '', 'color': null},
    "27": {'placed': '', 'color': null},
    "28": {'placed': '', 'color': null},
    "29": {'placed': '', 'color': null},
    "30": {'placed': '', 'color': null},
    "31": {'placed': '', 'color': null},
    "32": {'placed': '', 'color': null},
    "33": {'placed': '', 'color': null},
    "34": {'placed': '', 'color': null},
    "35": {'placed': '', 'color': null},
    "36": {'placed': '', 'color': null},
    "37": {'placed': '', 'color': null},
    "38": {'placed': '', 'color': null},
    "39": {'placed': '', 'color': null},
    "40": {'placed': '', 'color': null},
    "41": {'placed': '', 'color': null},
    "42": {'placed': '', 'color': null},
    "43": {'placed': '', 'color': null},
    "44": {'placed': '', 'color': null},
    "45": {'placed': '', 'color': null},
    "46": {'placed': '', 'color': null},
    "47": {'placed': '', 'color': null},
    "48": {'placed': '', 'color': null},
    "49": {'placed': '', 'color': null},
    "50": {'placed': '', 'color': null},
    "51": {'placed': '', 'color': null},
    "52": {'placed': '', 'color': null},
    "53": {'placed': '', 'color': null},
    "54": {'placed': '', 'color': null},
    "55": {'placed': '', 'color': null},
    "56": {'placed': '', 'color': null},
    "57": {'placed': '', 'color': null},
    "58": {'placed': '', 'color': null},
    "59": {'placed': '', 'color': null},
    "60": {'placed': '', 'color': null},
    "61": {'placed': '', 'color': null},
    "62": {'placed': '', 'color': null},
    "63": {'placed': '', 'color': null},
    "64": {'placed': '', 'color': null},
    "65": {'placed': '', 'color': null},
    "66": {'placed': '', 'color': null},
    "67": {'placed': '', 'color': null},
    "68": {'placed': '', 'color': null},
    "69": {'placed': '', 'color': null},
    "70": {'placed': '', 'color': null},
    "71": {'placed': '', 'color': null}
  },
  "tiles": {
    // - tiles links a dice roll value to a set of nodes and a resource
    // when a number is rolled, this is used to determine which nodes get
    // which resource
    // - this is also used to keep track of where the robber is in order to 
    // prevent certain nodes from getting resources 
    2: {robber: false, nodes: [], frequency: null, resource: null},
    3: {a:{robber: false, nodes: [], frequency: null, resource: null}, b:{robber: false, nodes: [], frequency: null, resource: null}},
    4: {a:{robber: false, nodes: [], frequency: null, resource: null}, b:{robber: false, nodes: [], frequency: null, resource: null}},
    5: {a:{robber: false, nodes: [], frequency: null, resource: null}, b:{robber: false, nodes: [], frequency: null, resource: null}},
    6: {a:{robber: false, nodes: [], frequency: null, resource: null}, b:{robber: false, nodes: [], frequency: null, resource: null}},
    8: {a:{robber: false, nodes: [], frequency: null, resource: null}, b:{robber: false, nodes: [], frequency: null, resource: null}},
    9: {a:{robber: false, nodes: [], frequency: null, resource: null}, b:{robber: false, nodes: [], frequency: null, resource: null}},
    10: {a:{robber: false, nodes: [], frequency: null, resource: null}, b:{robber: false, nodes: [], frequency: null, resource: null}},
    11: {a:{robber: false, nodes: [], frequency: null, resource: null}, b:{robber: false, nodes: [], frequency: null, resource: null}},
    12: {robber: false, nodes: [], frequency: null, resource: null},
    'previousLocation': {value: null, distinction: null}
  },

  // REFACTOR NOTE: Merge tileOrder and valueAndFrequencyOrder
  "tileValueFrequencyOrder": {
    // - tileValueFrequencyOrder is used to keep track of the order/placement
    // of the resource tiles + value/frequency tiles per row
    // - used to correctly assemble the board on the screen
    'tileOrder': {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
    },
    'valueAndFrequencyOrder': {
      0: {
        'values': [],
        'frequencies': [],
        'distinctions': []
      },
      1: {
        'values': [],
        'frequencies': [],
        'distinctions': []
      },
      2: {
        'values': [],
        'frequencies': [],
        'distinctions': []
      },
      3: {
        'values': [],
        'frequencies': [],
        'distinctions': []
      },
      4: {
        'values': [],
        'frequencies': [],
        'distinctions': []
      },
    }
  }
}

export default gameBoard;