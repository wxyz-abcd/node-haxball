module.exports = function(API){
  const { OperationType, VariableType, ConnectionState, AllowFlags, Direction, CollisionFlags, CameraFollow, BackgroundType, GamePlayState, BanEntryType, Callback, Utils, Room, Replay, Query, Library, RoomConfig, Plugin, Renderer, Errors, Language, EventFactory, Impl } = API;

  Object.setPrototypeOf(this, Plugin.prototype);
  Plugin.call(this, "CMD_chess", true, { // "chess" is plugin's name, "true" means "activated just after initialization". Every plugin should have a unique name.
    version: "0.1",
    author: "abc & jhlywa",
    description: `This plugin sets up a chess game.`,
    allowFlags: AllowFlags.CreateRoom // We allow this plugin to be activated on CreateRoom only.
  });
  
  this.defineVariable({
    name: "reset",
    type: VariableType.Void,
    value: function(){
      restart(that.FEN.length>0 ? that.FEN : null);
    },
    description: "Restarts the game."
  });
  
  this.defineVariable({
    name: "fillMethod",
    type: VariableType.Integer,
    value: 2,
    range: {
      min: 0,
      max: 2,
      step: 1
    },
    description: "Method to fill the squares of the board. 0: no fill, 1: diagonals only, 2: horizontal lines"
  });
  
  this.defineVariable({
    name: "boxSize",
    type: VariableType.Integer,
    value: 60,
    range: {
      min: 10,
      max: 2000,
      step: 1
    },
    description: "Edge length of each square of the board in map units."
  });
  
  this.defineVariable({
    name: "FEN",
    type: VariableType.String,
    value: "",
    range: {
      min: 0,
      max: 100
    },
    description: "State of the game in FEN notation."
  });
  
  this.defineVariable({
    name: "redFlag",
    type: VariableType.String,
    value: "tr",
    range: {
      min: 2,
      max: 3
    },
    description: "The flag of the red(white) players."
  });
  
  this.defineVariable({
    name: "blueFlag",
    type: VariableType.String,
    value: "br",
    range: {
      min: 2,
      max: 3
    },
    description: "The flag of the blue(black) players."
  });
  
  this.defineVariable({
    name: "playerNames",
    type: VariableType.Boolean,
    value: false,
    description: "Whether to show player names or not."
  });

  const props = {
    "p": {
      avatar: "♙",
      name: "Pawn"
    },
    "n": {
      avatar: "♘",
      name: "Knight"
    },
    "b": {
      avatar: "♗",
      name: "Bishop"
    },
    "r": {
      avatar: "♖",
      name: "Rook"
    },
    "q": {
      avatar: "♕",
      name: "Queen"
    },
    "k": {
      avatar: "♔",
      name: "King"
    }
  };

  /*
   * Copyright (c) 2020, Jeff Hlywa (jhlywa@gmail.com)
   * All rights reserved.
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *
   * 1. Redistributions of source code must retain the above copyright notice,
   *    this list of conditions and the following disclaimer.
   * 2. Redistributions in binary form must reproduce the above copyright notice,
   *    this list of conditions and the following disclaimer in the documentation
   *    and/or other materials provided with the distribution.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
   * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
   * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
   * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
   * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
   * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
   * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
   * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
   * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
   * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
   * POSSIBILITY OF SUCH DAMAGE.
   *
   *----------------------------------------------------------------------------*/
  
  /* minified license below  */
  
  /* @license
   * Copyright (c) 2018, Jeff Hlywa (jhlywa@gmail.com)
   * Released under the BSD license
   * https://github.com/jhlywa/chess.js/blob/master/LICENSE
   */
  
  var Chess = function(fen) {
    var BLACK = 'b'
    var WHITE = 'w'
  
    var EMPTY = -1
  
    var PAWN = 'p'
    var KNIGHT = 'n'
    var BISHOP = 'b'
    var ROOK = 'r'
    var QUEEN = 'q'
    var KING = 'k'
  
    var SYMBOLS = 'pnbrqkPNBRQK'
  
    var DEFAULT_POSITION =
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  
    var POSSIBLE_RESULTS = ['1-0', '0-1', '1/2-1/2', '*']
  
    var PAWN_OFFSETS = {
      b: [16, 32, 17, 15],
      w: [-16, -32, -17, -15]
    }
  
    var PIECE_OFFSETS = {
      n: [-18, -33, -31, -14, 18, 33, 31, 14],
      b: [-17, -15, 17, 15],
      r: [-16, 1, 16, -1],
      q: [-17, -16, -15, 1, 17, 16, 15, -1],
      k: [-17, -16, -15, 1, 17, 16, 15, -1]
    }
  
    // prettier-ignore
    var ATTACKS = [
      20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20, 0,
       0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
       0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
       0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
       0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
      24,24,24,24,24,24,56,  0, 56,24,24,24,24,24,24, 0,
       0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
       0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
       0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
       0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
      20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20
    ];
  
    // prettier-ignore
    var RAYS = [
       17,  0,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0,  0, 15, 0,
        0, 17,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0, 15,  0, 0,
        0,  0, 17,  0,  0,  0,  0, 16,  0,  0,  0,  0, 15,  0,  0, 0,
        0,  0,  0, 17,  0,  0,  0, 16,  0,  0,  0, 15,  0,  0,  0, 0,
        0,  0,  0,  0, 17,  0,  0, 16,  0,  0, 15,  0,  0,  0,  0, 0,
        0,  0,  0,  0,  0, 17,  0, 16,  0, 15,  0,  0,  0,  0,  0, 0,
        0,  0,  0,  0,  0,  0, 17, 16, 15,  0,  0,  0,  0,  0,  0, 0,
        1,  1,  1,  1,  1,  1,  1,  0, -1, -1,  -1,-1, -1, -1, -1, 0,
        0,  0,  0,  0,  0,  0,-15,-16,-17,  0,  0,  0,  0,  0,  0, 0,
        0,  0,  0,  0,  0,-15,  0,-16,  0,-17,  0,  0,  0,  0,  0, 0,
        0,  0,  0,  0,-15,  0,  0,-16,  0,  0,-17,  0,  0,  0,  0, 0,
        0,  0,  0,-15,  0,  0,  0,-16,  0,  0,  0,-17,  0,  0,  0, 0,
        0,  0,-15,  0,  0,  0,  0,-16,  0,  0,  0,  0,-17,  0,  0, 0,
        0,-15,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,-17,  0, 0,
      -15,  0,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,  0,-17
    ];
  
    var SHIFTS = { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 }
  
    var FLAGS = {
      NORMAL: 'n',
      CAPTURE: 'c',
      BIG_PAWN: 'b',
      EP_CAPTURE: 'e',
      PROMOTION: 'p',
      KSIDE_CASTLE: 'k',
      QSIDE_CASTLE: 'q'
    }
  
    var BITS = {
      NORMAL: 1,
      CAPTURE: 2,
      BIG_PAWN: 4,
      EP_CAPTURE: 8,
      PROMOTION: 16,
      KSIDE_CASTLE: 32,
      QSIDE_CASTLE: 64
    }
  
    var RANK_1 = 7
    var RANK_2 = 6
    var RANK_3 = 5
    var RANK_4 = 4
    var RANK_5 = 3
    var RANK_6 = 2
    var RANK_7 = 1
    var RANK_8 = 0
  
    // prettier-ignore
    var SQUARES = {
      a8:   0, b8:   1, c8:   2, d8:   3, e8:   4, f8:   5, g8:   6, h8:   7,
      a7:  16, b7:  17, c7:  18, d7:  19, e7:  20, f7:  21, g7:  22, h7:  23,
      a6:  32, b6:  33, c6:  34, d6:  35, e6:  36, f6:  37, g6:  38, h6:  39,
      a5:  48, b5:  49, c5:  50, d5:  51, e5:  52, f5:  53, g5:  54, h5:  55,
      a4:  64, b4:  65, c4:  66, d4:  67, e4:  68, f4:  69, g4:  70, h4:  71,
      a3:  80, b3:  81, c3:  82, d3:  83, e3:  84, f3:  85, g3:  86, h3:  87,
      a2:  96, b2:  97, c2:  98, d2:  99, e2: 100, f2: 101, g2: 102, h2: 103,
      a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
    };
  
    var ROOKS = {
      w: [
        { square: SQUARES.a1, flag: BITS.QSIDE_CASTLE },
        { square: SQUARES.h1, flag: BITS.KSIDE_CASTLE }
      ],
      b: [
        { square: SQUARES.a8, flag: BITS.QSIDE_CASTLE },
        { square: SQUARES.h8, flag: BITS.KSIDE_CASTLE }
      ]
    }
  
    var board = new Array(128)
    var kings = { w: EMPTY, b: EMPTY }
    var turn = WHITE
    var castling = { w: 0, b: 0 }
    var ep_square = EMPTY
    var half_moves = 0
    var move_number = 1
    var history = []
    var header = {}
  
    /* if the user passes in a fen string, load it, else default to
     * starting position
     */
    if (typeof fen === 'undefined') {
      load(DEFAULT_POSITION)
    } else {
      load(fen)
    }
  
    function clear(keep_headers) {
      if (typeof keep_headers === 'undefined') {
        keep_headers = false
      }
  
      board = new Array(128)
      kings = { w: EMPTY, b: EMPTY }
      turn = WHITE
      castling = { w: 0, b: 0 }
      ep_square = EMPTY
      half_moves = 0
      move_number = 1
      history = []
      if (!keep_headers) header = {}
      update_setup(generate_fen())
    }
  
    function reset() {
      load(DEFAULT_POSITION)
    }
  
    function load(fen, keep_headers) {
      if (typeof keep_headers === 'undefined') {
        keep_headers = false
      }
  
      var tokens = fen.split(/\s+/)
      var position = tokens[0]
      var square = 0
  
      if (!validate_fen(fen).valid) {
        return false
      }
  
      clear(keep_headers)
  
      for (var i = 0; i < position.length; i++) {
        var piece = position.charAt(i)
  
        if (piece === '/') {
          square += 8
        } else if (is_digit(piece)) {
          square += parseInt(piece, 10)
        } else {
          var color = piece < 'a' ? WHITE : BLACK
          put({ type: piece.toLowerCase(), color: color }, algebraic(square))
          square++
        }
      }
  
      turn = tokens[1]
  
      if (tokens[2].indexOf('K') > -1) {
        castling.w |= BITS.KSIDE_CASTLE
      }
      if (tokens[2].indexOf('Q') > -1) {
        castling.w |= BITS.QSIDE_CASTLE
      }
      if (tokens[2].indexOf('k') > -1) {
        castling.b |= BITS.KSIDE_CASTLE
      }
      if (tokens[2].indexOf('q') > -1) {
        castling.b |= BITS.QSIDE_CASTLE
      }
  
      ep_square = tokens[3] === '-' ? EMPTY : SQUARES[tokens[3]]
      half_moves = parseInt(tokens[4], 10)
      move_number = parseInt(tokens[5], 10)
  
      update_setup(generate_fen())
  
      return true
    }
  
    /* TODO: this function is pretty much crap - it validates structure but
     * completely ignores content (e.g. doesn't verify that each side has a king)
     * ... we should rewrite this, and ditch the silly error_number field while
     * we're at it
     */
    function validate_fen(fen) {
      var errors = {
        0: 'No errors.',
        1: 'FEN string must contain six space-delimited fields.',
        2: '6th field (move number) must be a positive integer.',
        3: '5th field (half move counter) must be a non-negative integer.',
        4: '4th field (en-passant square) is invalid.',
        5: '3rd field (castling availability) is invalid.',
        6: '2nd field (side to move) is invalid.',
        7: "1st field (piece positions) does not contain 8 '/'-delimited rows.",
        8: '1st field (piece positions) is invalid [consecutive numbers].',
        9: '1st field (piece positions) is invalid [invalid piece].',
        10: '1st field (piece positions) is invalid [row too large].',
        11: 'Illegal en-passant square'
      }
  
      /* 1st criterion: 6 space-seperated fields? */
      var tokens = fen.split(/\s+/)
      if (tokens.length !== 6) {
        return { valid: false, error_number: 1, error: errors[1] }
      }
  
      /* 2nd criterion: move number field is a integer value > 0? */
      if (isNaN(tokens[5]) || parseInt(tokens[5], 10) <= 0) {
        return { valid: false, error_number: 2, error: errors[2] }
      }
  
      /* 3rd criterion: half move counter is an integer >= 0? */
      if (isNaN(tokens[4]) || parseInt(tokens[4], 10) < 0) {
        return { valid: false, error_number: 3, error: errors[3] }
      }
  
      /* 4th criterion: 4th field is a valid e.p.-string? */
      if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
        return { valid: false, error_number: 4, error: errors[4] }
      }
  
      /* 5th criterion: 3th field is a valid castle-string? */
      if (!/^(KQ?k?q?|Qk?q?|kq?|q|-)$/.test(tokens[2])) {
        return { valid: false, error_number: 5, error: errors[5] }
      }
  
      /* 6th criterion: 2nd field is "w" (white) or "b" (black)? */
      if (!/^(w|b)$/.test(tokens[1])) {
        return { valid: false, error_number: 6, error: errors[6] }
      }
  
      /* 7th criterion: 1st field contains 8 rows? */
      var rows = tokens[0].split('/')
      if (rows.length !== 8) {
        return { valid: false, error_number: 7, error: errors[7] }
      }
  
      /* 8th criterion: every row is valid? */
      for (var i = 0; i < rows.length; i++) {
        /* check for right sum of fields AND not two numbers in succession */
        var sum_fields = 0
        var previous_was_number = false
  
        for (var k = 0; k < rows[i].length; k++) {
          if (!isNaN(rows[i][k])) {
            if (previous_was_number) {
              return { valid: false, error_number: 8, error: errors[8] }
            }
            sum_fields += parseInt(rows[i][k], 10)
            previous_was_number = true
          } else {
            if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
              return { valid: false, error_number: 9, error: errors[9] }
            }
            sum_fields += 1
            previous_was_number = false
          }
        }
        if (sum_fields !== 8) {
          return { valid: false, error_number: 10, error: errors[10] }
        }
      }
  
      if (
        (tokens[3][1] == '3' && tokens[1] == 'w') ||
        (tokens[3][1] == '6' && tokens[1] == 'b')
      ) {
        return { valid: false, error_number: 11, error: errors[11] }
      }
  
      /* everything's okay! */
      return { valid: true, error_number: 0, error: errors[0] }
    }
  
    function generate_fen() {
      var empty = 0
      var fen = ''
  
      for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
        if (board[i] == null) {
          empty++
        } else {
          if (empty > 0) {
            fen += empty
            empty = 0
          }
          var color = board[i].color
          var piece = board[i].type
  
          fen += color === WHITE ? piece.toUpperCase() : piece.toLowerCase()
        }
  
        if ((i + 1) & 0x88) {
          if (empty > 0) {
            fen += empty
          }
  
          if (i !== SQUARES.h1) {
            fen += '/'
          }
  
          empty = 0
          i += 8
        }
      }
  
      var cflags = ''
      if (castling[WHITE] & BITS.KSIDE_CASTLE) {
        cflags += 'K'
      }
      if (castling[WHITE] & BITS.QSIDE_CASTLE) {
        cflags += 'Q'
      }
      if (castling[BLACK] & BITS.KSIDE_CASTLE) {
        cflags += 'k'
      }
      if (castling[BLACK] & BITS.QSIDE_CASTLE) {
        cflags += 'q'
      }
  
      /* do we have an empty castling flag? */
      cflags = cflags || '-'
      var epflags = ep_square === EMPTY ? '-' : algebraic(ep_square)
  
      return [fen, turn, cflags, epflags, half_moves, move_number].join(' ')
    }
  
    function set_header(args) {
      for (var i = 0; i < args.length; i += 2) {
        if (typeof args[i] === 'string' && typeof args[i + 1] === 'string') {
          header[args[i]] = args[i + 1]
        }
      }
      return header
    }
  
    /* called when the initial board setup is changed with put() or remove().
     * modifies the SetUp and FEN properties of the header object.  if the FEN is
     * equal to the default position, the SetUp and FEN are deleted
     * the setup is only updated if history.length is zero, ie moves haven't been
     * made.
     */
    function update_setup(fen) {
      if (history.length > 0) return
  
      if (fen !== DEFAULT_POSITION) {
        header['SetUp'] = '1'
        header['FEN'] = fen
      } else {
        delete header['SetUp']
        delete header['FEN']
      }
    }
  
    function get(square) {
      var piece = board[SQUARES[square]]
      return piece ? { type: piece.type, color: piece.color } : null
    }
  
    function put(piece, square) {
      /* check for valid piece object */
      if (!('type' in piece && 'color' in piece)) {
        return false
      }
  
      /* check for piece */
      if (SYMBOLS.indexOf(piece.type.toLowerCase()) === -1) {
        return false
      }
  
      /* check for valid square */
      if (!(square in SQUARES)) {
        return false
      }
  
      var sq = SQUARES[square]
  
      /* don't let the user place more than one king */
      if (
        piece.type == KING &&
        !(kings[piece.color] == EMPTY || kings[piece.color] == sq)
      ) {
        return false
      }
  
      board[sq] = { type: piece.type, color: piece.color }
      if (piece.type === KING) {
        kings[piece.color] = sq
      }
  
      update_setup(generate_fen())
  
      return true
    }
  
    function remove(square) {
      var piece = get(square)
      board[SQUARES[square]] = null
      if (piece && piece.type === KING) {
        kings[piece.color] = EMPTY
      }
  
      update_setup(generate_fen())
  
      return piece
    }
  
    function build_move(board, from, to, flags, promotion) {
      var move = {
        color: turn,
        from: from,
        to: to,
        flags: flags,
        piece: board[from].type
      }
  
      if (promotion) {
        move.flags |= BITS.PROMOTION
        move.promotion = promotion
      }
  
      if (board[to]) {
        move.captured = board[to].type
      } else if (flags & BITS.EP_CAPTURE) {
        move.captured = PAWN
      }
      return move
    }
  
    function generate_moves(options) {
      function add_move(board, moves, from, to, flags) {
        /* if pawn promotion */
        if (
          board[from].type === PAWN &&
          (rank(to) === RANK_8 || rank(to) === RANK_1)
        ) {
          var pieces = [QUEEN, ROOK, BISHOP, KNIGHT]
          for (var i = 0, len = pieces.length; i < len; i++) {
            moves.push(build_move(board, from, to, flags, pieces[i]))
          }
        } else {
          moves.push(build_move(board, from, to, flags))
        }
      }
  
      var moves = []
      var us = turn
      var them = swap_color(us)
      var second_rank = { b: RANK_7, w: RANK_2 }
  
      var first_sq = SQUARES.a8
      var last_sq = SQUARES.h1
      var single_square = false
  
      /* do we want legal moves? */
      var legal =
        typeof options !== 'undefined' && 'legal' in options
          ? options.legal
          : true
  
      /* are we generating moves for a single square? */
      if (typeof options !== 'undefined' && 'square' in options) {
        if (options.square in SQUARES) {
          first_sq = last_sq = SQUARES[options.square]
          single_square = true
        } else {
          /* invalid square */
          return []
        }
      }
  
      for (var i = first_sq; i <= last_sq; i++) {
        /* did we run off the end of the board */
        if (i & 0x88) {
          i += 7
          continue
        }
  
        var piece = board[i]
        if (piece == null || piece.color !== us) {
          continue
        }
  
        if (piece.type === PAWN) {
          /* single square, non-capturing */
          var square = i + PAWN_OFFSETS[us][0]
          if (board[square] == null) {
            add_move(board, moves, i, square, BITS.NORMAL)
  
            /* double square */
            var square = i + PAWN_OFFSETS[us][1]
            if (second_rank[us] === rank(i) && board[square] == null) {
              add_move(board, moves, i, square, BITS.BIG_PAWN)
            }
          }
  
          /* pawn captures */
          for (j = 2; j < 4; j++) {
            var square = i + PAWN_OFFSETS[us][j]
            if (square & 0x88) continue
  
            if (board[square] != null && board[square].color === them) {
              add_move(board, moves, i, square, BITS.CAPTURE)
            } else if (square === ep_square) {
              add_move(board, moves, i, ep_square, BITS.EP_CAPTURE)
            }
          }
        } else {
          for (var j = 0, len = PIECE_OFFSETS[piece.type].length; j < len; j++) {
            var offset = PIECE_OFFSETS[piece.type][j]
            var square = i
  
            while (true) {
              square += offset
              if (square & 0x88) break
  
              if (board[square] == null) {
                add_move(board, moves, i, square, BITS.NORMAL)
              } else {
                if (board[square].color === us) break
                add_move(board, moves, i, square, BITS.CAPTURE)
                break
              }
  
              /* break, if knight or king */
              if (piece.type === 'n' || piece.type === 'k') break
            }
          }
        }
      }
  
      /* check for castling if: a) we're generating all moves, or b) we're doing
       * single square move generation on the king's square
       */
      if (!single_square || last_sq === kings[us]) {
        /* king-side castling */
        if (castling[us] & BITS.KSIDE_CASTLE) {
          var castling_from = kings[us]
          var castling_to = castling_from + 2
  
          if (
            board[castling_from + 1] == null &&
            board[castling_to] == null &&
            !attacked(them, kings[us]) &&
            !attacked(them, castling_from + 1) &&
            !attacked(them, castling_to)
          ) {
            add_move(board, moves, kings[us], castling_to, BITS.KSIDE_CASTLE)
          }
        }
  
        /* queen-side castling */
        if (castling[us] & BITS.QSIDE_CASTLE) {
          var castling_from = kings[us]
          var castling_to = castling_from - 2
  
          if (
            board[castling_from - 1] == null &&
            board[castling_from - 2] == null &&
            board[castling_from - 3] == null &&
            !attacked(them, kings[us]) &&
            !attacked(them, castling_from - 1) &&
            !attacked(them, castling_to)
          ) {
            add_move(board, moves, kings[us], castling_to, BITS.QSIDE_CASTLE)
          }
        }
      }
  
      /* return all pseudo-legal moves (this includes moves that allow the king
       * to be captured)
       */
      if (!legal) {
        return moves
      }
  
      /* filter out illegal moves */
      var legal_moves = []
      for (var i = 0, len = moves.length; i < len; i++) {
        make_move(moves[i])
        if (!king_attacked(us)) {
          legal_moves.push(moves[i])
        }
        undo_move()
      }
  
      return legal_moves
    }
  
    /* convert a move from 0x88 coordinates to Standard Algebraic Notation
     * (SAN)
     *
     * @param {boolean} sloppy Use the sloppy SAN generator to work around over
     * disambiguation bugs in Fritz and Chessbase.  See below:
     *
     * r1bqkbnr/ppp2ppp/2n5/1B1pP3/4P3/8/PPPP2PP/RNBQK1NR b KQkq - 2 4
     * 4. ... Nge7 is overly disambiguated because the knight on c6 is pinned
     * 4. ... Ne7 is technically the valid SAN
     */
    function move_to_san(move, sloppy) {
      var output = ''
  
      if (move.flags & BITS.KSIDE_CASTLE) {
        output = 'O-O'
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        output = 'O-O-O'
      } else {
        var disambiguator = get_disambiguator(move, sloppy)
  
        if (move.piece !== PAWN) {
          output += move.piece.toUpperCase() + disambiguator
        }
  
        if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
          if (move.piece === PAWN) {
            output += algebraic(move.from)[0]
          }
          output += 'x'
        }
  
        output += algebraic(move.to)
  
        if (move.flags & BITS.PROMOTION) {
          output += '=' + move.promotion.toUpperCase()
        }
      }
  
      make_move(move)
      if (in_check()) {
        if (in_checkmate()) {
          output += '#'
        } else {
          output += '+'
        }
      }
      undo_move()
  
      return output
    }
  
    // parses all of the decorators out of a SAN string
    function stripped_san(move) {
      return move.replace(/=/, '').replace(/[+#]?[?!]*$/, '')
    }
  
    function attacked(color, square) {
      for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
        /* did we run off the end of the board */
        if (i & 0x88) {
          i += 7
          continue
        }
  
        /* if empty square or wrong color */
        if (board[i] == null || board[i].color !== color) continue
  
        var piece = board[i]
        var difference = i - square
        var index = difference + 119
  
        if (ATTACKS[index] & (1 << SHIFTS[piece.type])) {
          if (piece.type === PAWN) {
            if (difference > 0) {
              if (piece.color === WHITE) return true
            } else {
              if (piece.color === BLACK) return true
            }
            continue
          }
  
          /* if the piece is a knight or a king */
          if (piece.type === 'n' || piece.type === 'k') return true
  
          var offset = RAYS[index]
          var j = i + offset
  
          var blocked = false
          while (j !== square) {
            if (board[j] != null) {
              blocked = true
              break
            }
            j += offset
          }
  
          if (!blocked) return true
        }
      }
  
      return false
    }
  
    function king_attacked(color) {
      return attacked(swap_color(color), kings[color])
    }
  
    function in_check() {
      return king_attacked(turn)
    }
  
    function in_checkmate() {
      return in_check() && generate_moves().length === 0
    }
  
    function in_stalemate() {
      return !in_check() && generate_moves().length === 0
    }
  
    function insufficient_material() {
      var pieces = {}
      var bishops = []
      var num_pieces = 0
      var sq_color = 0
  
      for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
        sq_color = (sq_color + 1) % 2
        if (i & 0x88) {
          i += 7
          continue
        }
  
        var piece = board[i]
        if (piece) {
          pieces[piece.type] = piece.type in pieces ? pieces[piece.type] + 1 : 1
          if (piece.type === BISHOP) {
            bishops.push(sq_color)
          }
          num_pieces++
        }
      }
  
      /* k vs. k */
      if (num_pieces === 2) {
        return true
      } else if (
        /* k vs. kn .... or .... k vs. kb */
        num_pieces === 3 &&
        (pieces[BISHOP] === 1 || pieces[KNIGHT] === 1)
      ) {
        return true
      } else if (num_pieces === pieces[BISHOP] + 2) {
        /* kb vs. kb where any number of bishops are all on the same color */
        var sum = 0
        var len = bishops.length
        for (var i = 0; i < len; i++) {
          sum += bishops[i]
        }
        if (sum === 0 || sum === len) {
          return true
        }
      }
  
      return false
    }
  
    function in_threefold_repetition() {
      /* TODO: while this function is fine for casual use, a better
       * implementation would use a Zobrist key (instead of FEN). the
       * Zobrist key would be maintained in the make_move/undo_move functions,
       * avoiding the costly that we do below.
       */
      var moves = []
      var positions = {}
      var repetition = false
  
      while (true) {
        var move = undo_move()
        if (!move) break
        moves.push(move)
      }
  
      while (true) {
        /* remove the last two fields in the FEN string, they're not needed
         * when checking for draw by rep */
        var fen = generate_fen()
          .split(' ')
          .slice(0, 4)
          .join(' ')
  
        /* has the position occurred three or move times */
        positions[fen] = fen in positions ? positions[fen] + 1 : 1
        if (positions[fen] >= 3) {
          repetition = true
        }
  
        if (!moves.length) {
          break
        }
        make_move(moves.pop())
      }
  
      return repetition
    }
  
    function push(move) {
      history.push({
        move: move,
        kings: { b: kings.b, w: kings.w },
        turn: turn,
        castling: { b: castling.b, w: castling.w },
        ep_square: ep_square,
        half_moves: half_moves,
        move_number: move_number
      })
    }
  
    function make_move(move) {
      var us = turn
      var them = swap_color(us)
      push(move)
  
      board[move.to] = board[move.from]
      board[move.from] = null
  
      /* if ep capture, remove the captured pawn */
      if (move.flags & BITS.EP_CAPTURE) {
        if (turn === BLACK) {
          board[move.to - 16] = null
        } else {
          board[move.to + 16] = null
        }
      }
  
      /* if pawn promotion, replace with new piece */
      if (move.flags & BITS.PROMOTION) {
        board[move.to] = { type: move.promotion, color: us }
      }
  
      /* if we moved the king */
      if (board[move.to].type === KING) {
        kings[board[move.to].color] = move.to
  
        /* if we castled, move the rook next to the king */
        if (move.flags & BITS.KSIDE_CASTLE) {
          var castling_to = move.to - 1
          var castling_from = move.to + 1
          board[castling_to] = board[castling_from]
          board[castling_from] = null
        } else if (move.flags & BITS.QSIDE_CASTLE) {
          var castling_to = move.to + 1
          var castling_from = move.to - 2
          board[castling_to] = board[castling_from]
          board[castling_from] = null
        }
  
        /* turn off castling */
        castling[us] = ''
      }
  
      /* turn off castling if we move a rook */
      if (castling[us]) {
        for (var i = 0, len = ROOKS[us].length; i < len; i++) {
          if (
            move.from === ROOKS[us][i].square &&
            castling[us] & ROOKS[us][i].flag
          ) {
            castling[us] ^= ROOKS[us][i].flag
            break
          }
        }
      }
  
      /* turn off castling if we capture a rook */
      if (castling[them]) {
        for (var i = 0, len = ROOKS[them].length; i < len; i++) {
          if (
            move.to === ROOKS[them][i].square &&
            castling[them] & ROOKS[them][i].flag
          ) {
            castling[them] ^= ROOKS[them][i].flag
            break
          }
        }
      }
  
      /* if big pawn move, update the en passant square */
      if (move.flags & BITS.BIG_PAWN) {
        if (turn === 'b') {
          ep_square = move.to - 16
        } else {
          ep_square = move.to + 16
        }
      } else {
        ep_square = EMPTY
      }
  
      /* reset the 50 move counter if a pawn is moved or a piece is captured */
      if (move.piece === PAWN) {
        half_moves = 0
      } else if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
        half_moves = 0
      } else {
        half_moves++
      }
  
      if (turn === BLACK) {
        move_number++
      }
      turn = swap_color(turn)
    }
  
    function undo_move() {
      var old = history.pop()
      if (old == null) {
        return null
      }
  
      var move = old.move
      kings = old.kings
      turn = old.turn
      castling = old.castling
      ep_square = old.ep_square
      half_moves = old.half_moves
      move_number = old.move_number
  
      var us = turn
      var them = swap_color(turn)
  
      board[move.from] = board[move.to]
      board[move.from].type = move.piece // to undo any promotions
      board[move.to] = null
  
      if (move.flags & BITS.CAPTURE) {
        board[move.to] = { type: move.captured, color: them }
      } else if (move.flags & BITS.EP_CAPTURE) {
        var index
        if (us === BLACK) {
          index = move.to - 16
        } else {
          index = move.to + 16
        }
        board[index] = { type: PAWN, color: them }
      }
  
      if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
        var castling_to, castling_from
        if (move.flags & BITS.KSIDE_CASTLE) {
          castling_to = move.to + 1
          castling_from = move.to - 1
        } else if (move.flags & BITS.QSIDE_CASTLE) {
          castling_to = move.to - 2
          castling_from = move.to + 1
        }
  
        board[castling_to] = board[castling_from]
        board[castling_from] = null
      }
  
      return move
    }
  
    /* this function is used to uniquely identify ambiguous moves */
    function get_disambiguator(move, sloppy) {
      var moves = generate_moves({ legal: !sloppy })
  
      var from = move.from
      var to = move.to
      var piece = move.piece
  
      var ambiguities = 0
      var same_rank = 0
      var same_file = 0
  
      for (var i = 0, len = moves.length; i < len; i++) {
        var ambig_from = moves[i].from
        var ambig_to = moves[i].to
        var ambig_piece = moves[i].piece
  
        /* if a move of the same piece type ends on the same to square, we'll
         * need to add a disambiguator to the algebraic notation
         */
        if (piece === ambig_piece && from !== ambig_from && to === ambig_to) {
          ambiguities++
  
          if (rank(from) === rank(ambig_from)) {
            same_rank++
          }
  
          if (file(from) === file(ambig_from)) {
            same_file++
          }
        }
      }
  
      if (ambiguities > 0) {
        /* if there exists a similar moving piece on the same rank and file as
         * the move in question, use the square as the disambiguator
         */
        if (same_rank > 0 && same_file > 0) {
          return algebraic(from)
        } else if (same_file > 0) {
          /* if the moving piece rests on the same file, use the rank symbol as the
           * disambiguator
           */
          return algebraic(from).charAt(1)
        } else {
          /* else use the file symbol */
          return algebraic(from).charAt(0)
        }
      }
  
      return ''
    }
  
    function ascii() {
      var s = '   +------------------------+\n'
      for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
        /* display the rank */
        if (file(i) === 0) {
          s += ' ' + '87654321'[rank(i)] + ' |'
        }
  
        /* empty piece */
        if (board[i] == null) {
          s += ' . '
        } else {
          var piece = board[i].type
          var color = board[i].color
          var symbol = color === WHITE ? piece.toUpperCase() : piece.toLowerCase()
          s += ' ' + symbol + ' '
        }
  
        if ((i + 1) & 0x88) {
          s += '|\n'
          i += 8
        }
      }
      s += '   +------------------------+\n'
      s += '     a  b  c  d  e  f  g  h\n'
  
      return s
    }
  
    // convert a move from Standard Algebraic Notation (SAN) to 0x88 coordinates
    function move_from_san(move, sloppy) {
      // strip off any move decorations: e.g Nf3+?!
      var clean_move = stripped_san(move)
  
      // if we're using the sloppy parser run a regex to grab piece, to, and from
      // this should parse invalid SAN like: Pe2-e4, Rc1c4, Qf3xf7
      if (sloppy) {
        var matches = clean_move.match(
          /([pnbrqkPNBRQK])?([a-h][1-8])x?-?([a-h][1-8])([qrbnQRBN])?/
        )
        if (matches) {
          var piece = matches[1]
          var from = matches[2]
          var to = matches[3]
          var promotion = matches[4]
        }
      }
  
      var moves = generate_moves()
      for (var i = 0, len = moves.length; i < len; i++) {
        // try the strict parser first, then the sloppy parser if requested
        // by the user
        if (
          clean_move === stripped_san(move_to_san(moves[i])) ||
          (sloppy && clean_move === stripped_san(move_to_san(moves[i], true)))
        ) {
          return moves[i]
        } else {
          if (
            matches &&
            (!piece || piece.toLowerCase() == moves[i].piece) &&
            SQUARES[from] == moves[i].from &&
            SQUARES[to] == moves[i].to &&
            (!promotion || promotion.toLowerCase() == moves[i].promotion)
          ) {
            return moves[i]
          }
        }
      }
  
      return null
    }
  
    /*****************************************************************************
     * UTILITY FUNCTIONS
     ****************************************************************************/
    function rank(i) {
      return i >> 4
    }
  
    function file(i) {
      return i & 15
    }
  
    function algebraic(i) {
      var f = file(i),
        r = rank(i)
      return 'abcdefgh'.substring(f, f + 1) + '87654321'.substring(r, r + 1)
    }
  
    function swap_color(c) {
      return c === WHITE ? BLACK : WHITE
    }
  
    function is_digit(c) {
      return '0123456789'.indexOf(c) !== -1
    }
  
    /* pretty = external move object */
    function make_pretty(ugly_move) {
      var move = clone(ugly_move)
      move.san = move_to_san(move, false)
      move.to = algebraic(move.to)
      move.from = algebraic(move.from)
  
      var flags = ''
  
      for (var flag in BITS) {
        if (BITS[flag] & move.flags) {
          flags += FLAGS[flag]
        }
      }
      move.flags = flags
  
      return move
    }
  
    function clone(obj) {
      var dupe = obj instanceof Array ? [] : {}
  
      for (var property in obj) {
        if (typeof property === 'object') {
          dupe[property] = clone(obj[property])
        } else {
          dupe[property] = obj[property]
        }
      }
  
      return dupe
    }
  
    function trim(str) {
      return str.replace(/^\s+|\s+$/g, '')
    }
  
    /*****************************************************************************
     * DEBUGGING UTILITIES
     ****************************************************************************/
    function perft(depth) {
      var moves = generate_moves({ legal: false })
      var nodes = 0
      var color = turn
  
      for (var i = 0, len = moves.length; i < len; i++) {
        make_move(moves[i])
        if (!king_attacked(color)) {
          if (depth - 1 > 0) {
            var child_nodes = perft(depth - 1)
            nodes += child_nodes
          } else {
            nodes++
          }
        }
        undo_move()
      }
  
      return nodes
    }
  
    return {
      /***************************************************************************
       * PUBLIC CONSTANTS (is there a better way to do this?)
       **************************************************************************/
      WHITE: WHITE,
      BLACK: BLACK,
      PAWN: PAWN,
      KNIGHT: KNIGHT,
      BISHOP: BISHOP,
      ROOK: ROOK,
      QUEEN: QUEEN,
      KING: KING,
      SQUARES: (function() {
        /* from the ECMA-262 spec (section 12.6.4):
         * "The mechanics of enumerating the properties ... is
         * implementation dependent"
         * so: for (var sq in SQUARES) { keys.push(sq); } might not be
         * ordered correctly
         */
        var keys = []
        for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
          if (i & 0x88) {
            i += 7
            continue
          }
          keys.push(algebraic(i))
        }
        return keys
      })(),
      FLAGS: FLAGS,
  
      /***************************************************************************
       * PUBLIC API
       **************************************************************************/
      load: function(fen) {
        return load(fen)
      },
  
      reset: function() {
        return reset()
      },
  
      moves: function(options) {
        /* The internal representation of a chess move is in 0x88 format, and
         * not meant to be human-readable.  The code below converts the 0x88
         * square coordinates to algebraic coordinates.  It also prunes an
         * unnecessary move keys resulting from a verbose call.
         */
  
        var ugly_moves = generate_moves(options)
        var moves = []
  
        for (var i = 0, len = ugly_moves.length; i < len; i++) {
          /* does the user want a full move object (most likely not), or just
           * SAN
           */
          if (
            typeof options !== 'undefined' &&
            'verbose' in options &&
            options.verbose
          ) {
            moves.push(make_pretty(ugly_moves[i]))
          } else {
            moves.push(move_to_san(ugly_moves[i], false))
          }
        }
  
        return moves
      },
  
      in_check: function() {
        return in_check()
      },
  
      in_checkmate: function() {
        return in_checkmate()
      },
  
      in_stalemate: function() {
        return in_stalemate()
      },
  
      in_draw: function() {
        return (
          half_moves >= 100 ||
          in_stalemate() ||
          insufficient_material() ||
          in_threefold_repetition()
        )
      },
  
      insufficient_material: function() {
        return insufficient_material()
      },
  
      in_threefold_repetition: function() {
        return in_threefold_repetition()
      },
  
      game_over: function() {
        return (
          half_moves >= 100 ||
          in_checkmate() ||
          in_stalemate() ||
          insufficient_material() ||
          in_threefold_repetition()
        )
      },
  
      validate_fen: function(fen) {
        return validate_fen(fen)
      },
  
      fen: function() {
        return generate_fen()
      },
  
      board: function() {
        var output = [],
          row = []
  
        for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
          if (board[i] == null) {
            row.push(null)
          } else {
            row.push({ type: board[i].type, color: board[i].color })
          }
          if ((i + 1) & 0x88) {
            output.push(row)
            row = []
            i += 8
          }
        }
  
        return output
      },
  
      pgn: function(options) {
        /* using the specification from http://www.chessclub.com/help/PGN-spec
         * example for html usage: .pgn({ max_width: 72, newline_char: "<br />" })
         */
        var newline =
          typeof options === 'object' && typeof options.newline_char === 'string'
            ? options.newline_char
            : '\n'
        var max_width =
          typeof options === 'object' && typeof options.max_width === 'number'
            ? options.max_width
            : 0
        var result = []
        var header_exists = false
  
        /* add the PGN header headerrmation */
        for (var i in header) {
          /* TODO: order of enumerated properties in header object is not
           * guaranteed, see ECMA-262 spec (section 12.6.4)
           */
          result.push('[' + i + ' "' + header[i] + '"]' + newline)
          header_exists = true
        }
  
        if (header_exists && history.length) {
          result.push(newline)
        }
  
        /* pop all of history onto reversed_history */
        var reversed_history = []
        while (history.length > 0) {
          reversed_history.push(undo_move())
        }
  
        var moves = []
        var move_string = ''
  
        /* build the list of moves.  a move_string looks like: "3. e3 e6" */
        while (reversed_history.length > 0) {
          var move = reversed_history.pop()
  
          /* if the position started with black to move, start PGN with 1. ... */
          if (!history.length && move.color === 'b') {
            move_string = move_number + '. ...'
          } else if (move.color === 'w') {
            /* store the previous generated move_string if we have one */
            if (move_string.length) {
              moves.push(move_string)
            }
            move_string = move_number + '.'
          }
  
          move_string = move_string + ' ' + move_to_san(move, false)
          make_move(move)
        }
  
        /* are there any other leftover moves? */
        if (move_string.length) {
          moves.push(move_string)
        }
  
        /* is there a result? */
        if (typeof header.Result !== 'undefined') {
          moves.push(header.Result)
        }
  
        /* history should be back to what is was before we started generating PGN,
         * so join together moves
         */
        if (max_width === 0) {
          return result.join('') + moves.join(' ')
        }
  
        /* wrap the PGN output at max_width */
        var current_width = 0
        for (var i = 0; i < moves.length; i++) {
          /* if the current move will push past max_width */
          if (current_width + moves[i].length > max_width && i !== 0) {
            /* don't end the line with whitespace */
            if (result[result.length - 1] === ' ') {
              result.pop()
            }
  
            result.push(newline)
            current_width = 0
          } else if (i !== 0) {
            result.push(' ')
            current_width++
          }
          result.push(moves[i])
          current_width += moves[i].length
        }
  
        return result.join('')
      },
  
      load_pgn: function(pgn, options) {
        // allow the user to specify the sloppy move parser to work around over
        // disambiguation bugs in Fritz and Chessbase
        var sloppy =
          typeof options !== 'undefined' && 'sloppy' in options
            ? options.sloppy
            : false
  
        function mask(str) {
          return str.replace(/\\/g, '\\')
        }
  
        function has_keys(object) {
          for (var key in object) {
            return true
          }
          return false
        }
  
        function parse_pgn_header(header, options) {
          var newline_char =
            typeof options === 'object' &&
            typeof options.newline_char === 'string'
              ? options.newline_char
              : '\r?\n'
          var header_obj = {}
          var headers = header.split(new RegExp(mask(newline_char)))
          var key = ''
          var value = ''
  
          for (var i = 0; i < headers.length; i++) {
            key = headers[i].replace(/^\[([A-Z][A-Za-z]*)\s.*\]$/, '$1')
            value = headers[i].replace(/^\[[A-Za-z]+\s"(.*)"\]$/, '$1')
            if (trim(key).length > 0) {
              header_obj[key] = value
            }
          }
  
          return header_obj
        }
  
        var newline_char =
          typeof options === 'object' && typeof options.newline_char === 'string'
            ? options.newline_char
            : '\r?\n'
  
        // RegExp to split header. Takes advantage of the fact that header and movetext
        // will always have a blank line between them (ie, two newline_char's).
        // With default newline_char, will equal: /^(\[((?:\r?\n)|.)*\])(?:\r?\n){2}/
        var header_regex = new RegExp(
          '^(\\[((?:' +
            mask(newline_char) +
            ')|.)*\\])' +
            '(?:' +
            mask(newline_char) +
            '){2}'
        )
  
        // If no header given, begin with moves.
        var header_string = header_regex.test(pgn)
          ? header_regex.exec(pgn)[1]
          : ''
  
        // Put the board in the starting position
        reset()
  
        /* parse PGN header */
        var headers = parse_pgn_header(header_string, options)
        for (var key in headers) {
          set_header([key, headers[key]])
        }
  
        /* load the starting position indicated by [Setup '1'] and
         * [FEN position] */
        if (headers['SetUp'] === '1') {
          if (!('FEN' in headers && load(headers['FEN'], true))) {
            // second argument to load: don't clear the headers
            return false
          }
        }
  
        /* delete header to get the moves */
        var ms = pgn
          .replace(header_string, '')
          .replace(new RegExp(mask(newline_char), 'g'), ' ')
  
        /* delete comments */
        ms = ms.replace(/(\{[^}]+\})+?/g, '')
  
        /* delete recursive annotation variations */
        var rav_regex = /(\([^\(\)]+\))+?/g
        while (rav_regex.test(ms)) {
          ms = ms.replace(rav_regex, '')
        }
  
        /* delete move numbers */
        ms = ms.replace(/\d+\.(\.\.)?/g, '')
  
        /* delete ... indicating black to move */
        ms = ms.replace(/\.\.\./g, '')
  
        /* delete numeric annotation glyphs */
        ms = ms.replace(/\$\d+/g, '')
  
        /* trim and get array of moves */
        var moves = trim(ms).split(new RegExp(/\s+/))
  
        /* delete empty entries */
        moves = moves
          .join(',')
          .replace(/,,+/g, ',')
          .split(',')
        var move = ''
  
        for (var half_move = 0; half_move < moves.length - 1; half_move++) {
          move = move_from_san(moves[half_move], sloppy)
  
          /* move not possible! (don't clear the board to examine to show the
           * latest valid position)
           */
          if (move == null) {
            return false
          } else {
            make_move(move)
          }
        }
  
        /* examine last move */
        move = moves[moves.length - 1]
        if (POSSIBLE_RESULTS.indexOf(move) > -1) {
          if (has_keys(header) && typeof header.Result === 'undefined') {
            set_header(['Result', move])
          }
        } else {
          move = move_from_san(move, sloppy)
          if (move == null) {
            return false
          } else {
            make_move(move)
          }
        }
        return true
      },
  
      header: function() {
        return set_header(arguments)
      },
  
      ascii: function() {
        return ascii()
      },
  
      turn: function() {
        return turn
      },
  
      move: function(move, options) {
        /* The move function can be called with in the following parameters:
         *
         * .move('Nxb7')      <- where 'move' is a case-sensitive SAN string
         *
         * .move({ from: 'h7', <- where the 'move' is a move object (additional
         *         to :'h8',      fields are ignored)
         *         promotion: 'q',
         *      })
         */
  
        // allow the user to specify the sloppy move parser to work around over
        // disambiguation bugs in Fritz and Chessbase
        var sloppy =
          typeof options !== 'undefined' && 'sloppy' in options
            ? options.sloppy
            : false
  
        var move_obj = null
  
        if (typeof move === 'string') {
          move_obj = move_from_san(move, sloppy)
        } else if (typeof move === 'object') {
          var moves = generate_moves()
  
          /* convert the pretty move object to an ugly move object */
          for (var i = 0, len = moves.length; i < len; i++) {
            if (
              move.from === algebraic(moves[i].from) &&
              move.to === algebraic(moves[i].to) &&
              (!('promotion' in moves[i]) ||
                move.promotion === moves[i].promotion)
            ) {
              move_obj = moves[i]
              break
            }
          }
        }
  
        /* failed to find move */
        if (!move_obj) {
          return null
        }
  
        /* need to make a copy of move because we can't generate SAN after the
         * move is made
         */
        var pretty_move = make_pretty(move_obj)
  
        make_move(move_obj)
  
        return pretty_move
      },
  
      undo: function() {
        var move = undo_move()
        return move ? make_pretty(move) : null
      },
  
      clear: function() {
        return clear()
      },
  
      put: function(piece, square) {
        return put(piece, square)
      },
  
      get: function(square) {
        return get(square)
      },
  
      remove: function(square) {
        return remove(square)
      },
  
      perft: function(depth) {
        return perft(depth)
      },
  
      square_color: function(square) {
        if (square in SQUARES) {
          var sq_0x88 = SQUARES[square]
          return (rank(sq_0x88) + file(sq_0x88)) % 2 === 0 ? 'light' : 'dark'
        }
  
        return null
      },
  
      history: function(options) {
        var reversed_history = []
        var move_history = []
        var verbose =
          typeof options !== 'undefined' &&
          'verbose' in options &&
          options.verbose
  
        while (history.length > 0) {
          reversed_history.push(undo_move())
        }
  
        while (reversed_history.length > 0) {
          var move = reversed_history.pop()
          if (verbose) {
            move_history.push(make_pretty(move))
          } else {
            move_history.push(move_to_san(move))
          }
          make_move(move)
        }
  
        return move_history
      },
      
      isMoveValid: function(move){
        var moves = generate_moves();
        for (var i = 0, len = moves.length; i < len; i++) {
          if (
            move.from === algebraic(moves[i].from) &&
            move.to === algebraic(moves[i].to) &&
            (!('promotion' in moves[i]) ||
              move.promotion === moves[i].promotion)
          )
            return true;
        }
        return false;
      }
    }
  }

  var that = this, gameState, permissionCtx, permissionIds, currentPlayer, pickedUp, autoStart = false, autoReorder = false, drawOffered = false, pawnPromotion = null, acceptMoveTeamsForPieces = true, pieceData = [], lastPlayerIdxs = [];

	function squareName(x,y){
		return String.fromCharCode(97+x)+(8-y);
	}
	
	function getPiece(x,y){
		return gameState.get(squareName(x,y));
	}
	
	function makeMove(x1,y1,x2,y2){
		return gameState.move({
			from: squareName(x1,y1),
			to: squareName(x2,y2),
			//promotion: "q"
		});
	}

  function createPiece(id, x, y, offsetX, offsetY){
    return new Promise((resolve, reject)=>{
      var piece = getPiece(x,y);
      that.room.fakePlayerLeave(id);
      if (!piece){
        resolve();
        return;
      }
      pieceData[y][x] = {
        id,
        piece
      };
      var { color, type } = piece;
      var team = (color=="b") ? 2 : 1, flag = (team==1) ? that.redFlag : that.blueFlag;
      var p = props[type];
      that.room.fakePlayerJoin(id, that.playerNames ? p.name : "", flag, p.avatar);
      Utils.runAfterGameTick(()=>{
        that.room.setPlayerTeam(id, team);
        Utils.runAfterGameTick(()=>{
          that.room.setPlayerDiscProperties(id, {
            x: offsetX+x*that.boxSize,
            y: offsetY+y*that.boxSize
          });
        });
        resolve();
      });
    });
  }
  
  function resetPlayer(player){
    if (typeof player!="number")
      player = player.id;
    that.room.setPlayerDiscProperties(player, {
      x: NaN,
      y: NaN
    });
  }
  
  function updatePlayerInSquare(x, y){
    var data = pieceData[y]?.[x];
    if (!data?.piece)
      return;
    var {id, piece} = data, {avatar} = props[piece.type];
    var player = that.room.players.find((x)=>x.id==id);
    if (player.avatar!=avatar)
      that.room.fakeSetPlayerAvatar(avatar, id);
    that.room.setPlayerDiscProperties(id, {
      x: (x-3.5)*that.boxSize,
      y: (y-3.5)*that.boxSize
    });
    that.room.fakeSendPlayerInput(0, id);
  }

  function resetPickedUpPlayer(){
    if (!pickedUp || !gameState || pawnPromotion)
      return;
    var coords = {
      x: (pickedUp.oldX-3.5)*that.boxSize,
      y: (pickedUp.oldY-3.5)*that.boxSize
    };
    that.room.setPlayerDiscProperties(pickedUp.player.id, coords);
    that.room.fakeSendPlayerInput(0, pickedUp.player.id);
    pickedUp = null;
    return coords;
  }

  function nextPlayer(){
    if (currentPlayer){
      resetPlayer(currentPlayer);
      currentPlayer = null;
    }
    resetPickedUpPlayer();
    var newTurn = (gameState.turn()=="b") ? 2 : 1;
    var nextPlayerIdx = lastPlayerIdxs[newTurn-1];
    if (nextPlayerIdx==null)
      nextPlayerIdx = -1;
    nextPlayerIdx++;
    var idx = -1;
    for (var i=0;i<that.room.players.length;i++){
      var p = that.room.players[i];
      if (p.id>=48000 && p.id<48064)
        continue;
      if (p.team.id==newTurn){
        if ((++idx)==nextPlayerIdx){
          currentPlayer = p;
          break;
        }
      }
    }
    if (idx>=0 && !currentPlayer){
      nextPlayerIdx = 0;
      for (var i=0;i<that.room.players.length;i++){
        var p = that.room.players[i];
        if (p.id>=48000 && p.id<48064)
          continue;
        if (p.team.id==newTurn){
          currentPlayer = p;
          break;
        }
      }
    }
    if (!currentPlayer)
      return;
    lastPlayerIdxs[newTurn-1] = nextPlayerIdx;
    Utils.runAfterGameTick(()=>{
      if (pawnPromotion)
        resetPlayer(currentPlayer);
      else
        that.room.setPlayerDiscProperties(currentPlayer?.id, {
          x: that.boxSize/2,
          y: (3-2*newTurn)*7*that.boxSize/2
        });
    }, 5);
  }

  function restart(fen, stopgame=true){
    var boxSize = parseFloat(that.boxSize);
    var chess = new Chess();
    if (fen && !chess.load(fen)){
      that.room.librariesMap.commands?.announceError("Error while parsing FEN string: "+chess.validate_fen(fen).error);
      return;
    }
  	gameState = chess;
  	if (stopgame)
      that.room?.stopGame?.();
    var offsetX = -4*boxSize, offsetY = -4*boxSize, playerTeams = {};
    that.room.players.forEach((p)=>{
      if (p.id>=48000 && p.id<48064)
        return;
      playerTeams[p.id] = p.team.id;
    });
    that.room.players.forEach((p)=>{
      if (p.id>=48000 && p.id<48064)
        return;
      that.room.setPlayerTeam(p.id, 0);
    });
    var stadiumJson = {
    	"name" : "Chess",
    	"width" : 0,
    	"height" : 0,
    	"cameraWidtwh" : 0,
    	"cameraHeight" : 0,
    	"maxViewWidth" : 0,
    	"cameraFollow" : "player",
    	"spawnDistance" : 0,
    	"redSpawnPoints" : [[boxSize/2, 7*boxSize/2]],
    	"blueSpawnPoints" : [[boxSize/2, -7*boxSize/2]],
    	"canBeStored" : true,
    	"kickOffReset" : "partial",
    	"bg" : { "color" : "777700" },
    	"vertexes" : [],
    	"segments" : [],
    	"goals" : [],
    	"discs" : [],
    	"planes" : [],
    	"joints" : [],
    	"traits" : {
    	  "blackSeg": {
      		"cMask" : ["none"],
      		"cGroup" : ["c0"],
    	    "color": "000000"
    	  },
    	  "whiteSeg": {
      		"cMask" : ["none"],
      		"cGroup" : ["c0"],
    	    "color": "ffffff"
    	  },
    	  "borderSeg": {
      		"cMask" : ["none"],
      		"cGroup" : ["c0"],
    	    "color": "44cc44"
    	  }
    	},
    	"playerPhysics" : {
    		"radius" : boxSize/3,
    		"cMask" : ["none"],
    		"cGroup" : ["c0"],
    		"gravity" : [0, 0],
    		"acceleration" : 0,
    		"damping" : 0,
    		"kickingAcceleration" : 0,
    		"kickingDamping" : 0,
    		"kickStrength" : 0,
    		"kickback" : 0
    	},
    	"ballPhysics" : {
    		"radius" : 0,
    		"cMask" : ["none"],
    		"cGroup" : ["c0"]
    	}
    };
    var v = 0;
    for (var i=0;i<=8;i++){
      stadiumJson.vertexes.push({"x": i*boxSize+offsetX, "y": offsetY});
      stadiumJson.vertexes.push({"x": i*boxSize+offsetX, "y": -offsetY});
      stadiumJson.segments.push({"v0": v, "v1": v+1, "trait": "borderSeg"});
      v+=2;
    }
    stadiumJson.segments.push({"v0": 0, "v1": 16, "trait": "borderSeg"});
    stadiumJson.segments.push({"v0": 1, "v1": 17, "trait": "borderSeg"});
    for (var i=1;i<=7;i++){
      stadiumJson.vertexes.push({"x": offsetX, "y": i*boxSize+offsetY});
      stadiumJson.vertexes.push({"x": -offsetX, "y": i*boxSize+offsetY});
      stadiumJson.segments.push({"v0": v, "v1": v+1, "trait": "borderSeg"});
      v+=2;
    }
    if (that.fillMethod==1){
      for (var i=-1;i<6;i++)
        stadiumJson.segments.push({"v0": 28-2*i, "v1": 5+2*i, "trait": i%2==0?"blackSeg":"whiteSeg"});
      stadiumJson.segments.push({"v0": 0, "v1": 17, "trait": "blackSeg"});
      for (var i=0;i<7;i++)
        stadiumJson.segments.push({"v0": 2*i+2, "v1": 31-2*i, "trait": i%2==1?"blackSeg":"whiteSeg"});
      stadiumJson.segments.push({"v0": 1, "v1": 16, "trait": "whiteSeg"});
      for (var i=-1;i<13;i++)
        stadiumJson.segments.push({"v0": 3+i, "v1": 19+i, "trait": (i%4==0 || i%4==3 || i%3==-1)?"blackSeg":"whiteSeg"});
    }
    else if (that.fillMethod==2)
      for (var k=0, yStart=offsetY+boxSize/4;k<8;k++, yStart+=boxSize, v+=27){
        for (var i=0, y=yStart;i<3;i++, y+=boxSize/4)
          stadiumJson.vertexes.push({"x": offsetX, "y": y});
        for (var j=0;j<8;j++)
          for (var i=0, y=yStart;i<3;i++, y+=boxSize/4){
            stadiumJson.vertexes.push({"x": offsetX+(j+1)*boxSize, "y": y});
            stadiumJson.segments.push({"v0": v+3*j+i, "v1": v+3*j+3+i, "trait": (j+k)%2==0?"blackSeg":"whiteSeg"});
          }
      }
    v = 48000;
  	pieceData = [];
  	lastPlayerIdxs = [];
    var stadium = Utils.parseStadium(JSON.stringify(stadiumJson), (e)=>{console.log(stadiumJson, e.toString())});
    if (!stadium)
      return;
    that.room.setCurrentStadium(stadium, console.log);
    that.room.setTeamColors(1, 0, "000000", "ffffff");
    that.room.setTeamColors(2, 0, "ffffff", "000000");
    if (stopgame){
      autoStart = true;
      that.room.startGame();
      autoStart = false;
    }
    offsetX+=0.5*boxSize;
    offsetY+=0.5*boxSize;
    var parr = [];
    acceptMoveTeamsForPieces = true;
    for (var y=0;y<8;y++){
      pieceData[y] = [];
      for (var x=0;x<8;x++)
        parr.push(createPiece(48000+parr.length, x, y, offsetX, offsetY));
    }
    drawOffered = false;
    pawnPromotion = null;
    Promise.all(parr).then(()=>{
      acceptMoveTeamsForPieces = false;
      Utils.runAfterGameTick(()=>{
        that.room.players.forEach((p)=>{
          if (p.id>=48000 && p.id<48064)
            return;
          that.room.setPlayerTeam(p.id, playerTeams[p.id]);
          resetPlayer(p);
        });
        nextPlayer();
        if (sendChessNotifications())
          setTimeout(()=>{
            that.room?.stopGame?.();
          }, 5000);
        Utils.runAfterGameTick(()=>{
          var n = 0;
          var a = that.room?.players?.filter?.((x, i)=>{
            if ((x.id<48000 || x.id>=48064)&&i<(n+32)){
              n++;
              return true;
            }
            return false;
          }).map((x)=>x.id);
          if (a.length>0){
            autoReorder = true;
            that.room?.reorderPlayers?.(a, false);
            autoReorder = false;
          }
        }, 4);
      });
    });
  }
  
  function updatePieceData(move){
    var board = gameState.board(), coords1 = [], coords2 = [], coords3 = [];
    for (var r=0;r<8;r++)
      for (var c=0;c<8;c++){
        var cell = pieceData[r]?.[c], currentPiece = board[r]?.[c];
        if (cell?.piece?.type==currentPiece?.type && cell?.piece?.color==currentPiece?.color)
          continue;
        if (!cell?.piece)
          coords1.push({r,c});
        else if (!currentPiece)
          coords2.push({r,c});
        else if (cell.piece.type!=currentPiece.type || cell.piece.color!=currentPiece.color)
          coords3.push({r,c});
      }
    if (coords1.length==coords2.length){ // normal moves / castling / promotion
      var match = {};
      for (var i=0;i<coords1.length;i++){
        var c1 = coords1[i], p = board[c1.r][c1.c];
        for (var j=0;j<coords2.length;j++){
          var c2 = coords2[j], q = pieceData[c2.r][c2.c].piece;
          if ((q.type==p.type || (move.promotion && q.type=="p")) && q.color==p.color){
            match[i] = j;
            break;
          }
        }
      }
      for (var i=0;i<coords1.length;i++){
        var c1 = coords1[i], c2 = coords2[match[i]];
        pieceData[c1.r][c1.c] = {
          id: pieceData[c2.r][c2.c].id,
          piece: board[c1.r][c1.c]
        };
        pieceData[c2.r][c2.c] = null;
        updatePlayerInSquare(c1.c, c1.r);
      }
      return;
    }
    if (coords2.length==coords3.length){ // capturing / capturing + promotion
      for (var i=0;i<coords2.length;i++){
        var c1 = coords2[i], c2 = coords3[i];
        resetPlayer(pieceData[c2.r][c2.c].id);
        pieceData[c2.r][c2.c] = {
          id: pieceData[c1.r][c1.c].id,
          piece: board[c2.r][c2.c]
        };
        pieceData[c1.r][c1.c] = null;
        updatePlayerInSquare(c2.c, c2.r);
      }
      return;
    }
    if (coords1.length==1 && coords2.length==2){ // en passant
      var c0 = coords1[0], i;
      for (i=0;i<2;i++)
        if (Math.abs(coords2[i].c-c0.c)==1 && Math.abs(coords2[i].r-c0.r)==1)
          break;
      var c1 = coords2[i], c2 = coords2[1-i];
      // c1 -> c0, capture: c2
      resetPlayer(pieceData[c2.r][c2.c].id);
      pieceData[c0.r][c0.c] = {
        id: pieceData[c1.r][c1.c].id,
        piece: board[c0.r][c0.c]
      };
      pieceData[c1.r][c1.c] = null;
      pieceData[c2.r][c2.c] = null;
      updatePlayerInSquare(c0.c, c0.r);
      return;
    }
    // unknown move type
    console.log(move);
  }
  
  function announceInfo(text){
    Utils.runAfterGameTick(()=>{
      that.room.librariesMap.commands?.announceInfo(text);
    }, 4);
  }
  
  function sendChessNotifications(){
    if (!gameState)
      return;
    if (gameState.game_over()){
      if (gameState.in_checkmate())
        announceInfo("CHECKMATE! " + (gameState.turn()=="b" ? "WHITE" : "BLACK") + " WON!");
      else if (gameState.in_stalemate())
        announceInfo("DRAW: STALEMATE!");
      else if (gameState.insufficient_material())
        announceInfo("DRAW: INSUFFICIENT MATERIAL!");
      else if (gameState.in_threefold_repetition())
        announceInfo("DRAW: THREEFOLD REPETITION!");
      else
        announceInfo("DRAW: 50 MOVE RULE!");
      return true;
    }
    else if (gameState.in_check())
      announceInfo("CHECK!");
    that.FEN = gameState.fen();
  }

  this.initialize = function(){
    permissionCtx = that.room.librariesMap.permissions?.createContext("chess");
    if (permissionCtx)
      permissionIds = {
        reset: permissionCtx.addPermission("reset"),
        load: permissionCtx.addPermission("load"),
        fen: permissionCtx.addPermission("fen")
      };
    that.room.librariesMap.commands?.add({
      name: "reset",
      parameters: [],
      minParameterCount: 0,
      helpText: "Restarts the game.",
      callback: ({}, byId) => {
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.reset)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        restart();
      }
    });
    that.room.librariesMap.commands?.add({
      name: "resign",
      parameters: [],
      minParameterCount: 0,
      helpText: "Forfeits the match.",
      callback: ({}, byId) => {
        if (!gameState || currentPlayer?.id!=byId)
          return;
        announceInfo((gameState.turn()=="w"?"WHITE":"BLACK")+" RESIGNED!");
        setTimeout(()=>{
          that.room?.stopGame?.();
        }, 5000);
      }
    });
    that.room.librariesMap.commands?.add({
      name: "draw",
      parameters: [],
      minParameterCount: 0,
      helpText: "Offers a draw.",
      callback: ({}, byId) => {
        if (!gameState || currentPlayer?.id!=byId || drawOffered)
          return;
        announceInfo((gameState.turn()=="w"?"WHITE":"BLACK")+" offered a draw.");
        drawOffered = true;
      }
    });
    that.room.librariesMap.commands?.add({
      name: "acceptDraw",
      parameters: [],
      minParameterCount: 0,
      helpText: "Accepts the draw offer and ends the game as a draw.",
      callback: ({}, byId) => {
        if (!gameState || !drawOffered)
          return;
        var p = that.room.players.find((x)=>x.id==byId);
        if (p?.team.id!=(gameState.turn()=="w"?2:1))
          return;
        announceInfo("DRAW: MUTUAL AGREEMENT!");
        setTimeout(()=>{
          that.room?.stopGame?.();
        }, 5000);
      }
    });
    that.room.librariesMap.commands?.add({
      name: "promote",
      parameters: [{
        name: "char",
        type: VariableType.String
      }],
      minParameterCount: 1,
      helpText: "Promotes the pawn to the selected piece type(char) where char can be one of n, b, r or q. (n=knight, b=bishop, r=rook, q=queen)",
      callback: ({char}, byId) => {
        if (!gameState || !pawnPromotion)
          return;
        var p = that.room.players.find((x)=>x.id==byId);
        if (p?.team.id!=(gameState.turn()=="w"?1:2))
          return
        char = char.toLowerCase();
        if (!"nbrq".includes(char))
          return;
        updatePieceData(gameState.move({
    			from: squareName(pawnPromotion[0],pawnPromotion[1]),
    			to: squareName(pawnPromotion[2],pawnPromotion[3]),
    			promotion: char
    		}));
        pawnPromotion = null;
        that.room.fakeSendPlayerInput(0, pickedUp.player.id);
        pickedUp = null;
        nextPlayer();
        drawOffered = false;
        if (sendChessNotifications())
          setTimeout(()=>{
            that.room?.stopGame?.();
          }, 5000);
      }
    });
    that.room.librariesMap.commands?.add({
      name: "load",
      parameters: [{
        name: "fen1",
        type: VariableType.String
      }, {
        name: "fen2",
        type: VariableType.String
      }, {
        name: "fen3",
        type: VariableType.String
      }, {
        name: "fen4",
        type: VariableType.String
      }, {
        name: "fen5",
        type: VariableType.String
      }, {
        name: "fen6",
        type: VariableType.String
      }],
      minParameterCount: 0,
      helpText: "Restarts the game from a predefined position determined by a FEN string.",
      callback: ({fen1, fen2, fen3, fen4, fen5, fen6}, byId) => {
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.load)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        restart(fen1+" "+fen2+" "+fen3+" "+fen4+" "+fen5+" "+fen6);
      }
    });
    that.room.librariesMap.commands?.add({
      name: "fen",
      parameters: [],
      minParameterCount: 0,
      helpText: "Outputs the FEN string that represents the current game state.",
      callback: ({}, byId) => {
        if (byId!=0 && !permissionCtx?.checkPlayerPermission(byId, permissionIds.fen)){
          that.room.librariesMap.commands?.announcePermissionDenied(byId);
          return;
        }
        announceInfo("Current FEN string: "+gameState?.fen());
      }
    });
    setTimeout(restart, 1000);
  };

  this.finalize = function(){
    lastPlayerIdxs = null;
    pieceData = null;
    gameState = null;
    that.room.librariesMap?.commands?.remove("reset");
    that.room.librariesMap?.commands?.remove("load");
    that.room.librariesMap?.commands?.remove("fen");
    that.room.librariesMap?.permissions?.removeContext(permissionCtx);
    permissionCtx = null;
    permissionIds = null;
  };
  
  this.onGameStart = function(){
    if (autoStart)
      return;
    restart(null, false);
    //setTimeout(updatePlayerDiscs, 100);
  };

  this.onPlayerTeamChange = function(id, teamId, byId){
    if (id>=48000 && id<48064)
      return;
    if (!currentPlayer || currentPlayer.id==id)
      nextPlayer();
    if (id!=currentPlayer?.id)
      Utils.runAfterGameTick(()=>{
        resetPlayer(id);
      });
  };
  
  this.onPlayerLeave = function(playerObj, reason, isBanned, byId){
    var { id } = playerObj;
    if (id>=48000 && id<48064)
      return;
    if (currentPlayer?.id==id)
      nextPlayer();
  };

  this.onAutoTeams = function(pid1, tid1, pid2, tid2, byId){
    //updatePlayerDiscs();
  };

  this.onOperationReceived = function(type, msg, globalFrameNo, clientFrameNo, customData){
    if (type==OperationType.AutoTeams)
      return false;
    if (type==OperationType.ReorderPlayers)
      return autoReorder;
    if (type==OperationType.SetPlayerTeam)
      return (acceptMoveTeamsForPieces || msg.playerId<48000 || msg.playerId>=48064);
    if (type!=OperationType.SendInput || !gameState)
      return true;
    if (pawnPromotion)
      return false;
    var p = that.room.players.find((x)=>x.id==msg.byId), d = p?.disc;
    if (p!=currentPlayer && p!=pickedUp?.player)
      return false;
    if (!d)
      return true;
    var ix = d.pos.x/that.boxSize+3.5, iy = d.pos.y/that.boxSize+3.5;
    switch(msg.input){
      case 0:
        return true;
      case 1://up
      case 17://up+kick
      case 2://down
      case 18://down+kick
      case 4://left
      case 20://left+kick
      case 8://right
      case 24://right+kick
        if (p==currentPlayer){
          if (pickedUp)
            that.room.fakeSendPlayerInput(msg.input|16, pickedUp.player.id);
          else{
            var {dirX, dirY} = Utils.reverseKeyState(msg.input);
            var newX = ix+dirX, newY = iy+dirY;
            if (newX<0)
              newX = 7;
            else if (newX>=8)
              newX = 0;
            if (newY<0)
              newY = 7;
            else if (newY>=8)
              newY = 0;
            that.room.setPlayerDiscProperties(p.id, {
              x: (newX-3.5)*that.boxSize,
              y: (newY-3.5)*that.boxSize
            });
          }
        }
        else if (p==pickedUp?.player){
          var {dirX, dirY} = Utils.reverseKeyState(msg.input);
          var newX = ix+dirX, newY = iy+dirY;
          if (newX<0)
            newX = 7;
          else if (newX>=8)
            newX = 0;
          if (newY<0)
            newY = 7;
          else if (newY>=8)
            newY = 0;
          that.room.setPlayerDiscProperties(p.id, {
            x: (newX-3.5)*that.boxSize,
            y: (newY-3.5)*that.boxSize
          });
        }
        break;
      case 16://kick
        if (p==currentPlayer){
          var turn = gameState.turn();
          if (pickedUp?.player){
            var p = pickedUp.player.disc.pos, newX = p?.x/that.boxSize+3.5, newY = p?.y/that.boxSize+3.5;
            var piece = getPiece(pickedUp.oldX, pickedUp.oldY);
            if (piece?.type=="p" && piece.color==turn && pickedUp.oldY==((turn=="w") ? 1 : 6) && gameState.isMoveValid({
          			from: squareName(pickedUp.oldX, pickedUp.oldY),
          			to: squareName(newX, newY),
          			promotion: "q"
              })){
              pawnPromotion = [pickedUp.oldX, pickedUp.oldY, newX, newY];
              announceInfo("INFO: Use !promote [char] to promote your pawn where [char] can be any one of n, b, r, q.");
              return false;
            }
            var m = makeMove(pickedUp.oldX, pickedUp.oldY, newX, newY);
            if (m){
              updatePieceData(m);
              that.room.fakeSendPlayerInput(0, pickedUp.player.id);
              pickedUp = null;
              nextPlayer();
              drawOffered = false;
              //that.room.setPlayerTeam(0, (turn=="b") ? 1 : 2);
              if (sendChessNotifications())
                setTimeout(()=>{
                  that.room?.stopGame?.();
                }, 5000);
            }
            else
              that.room.setPlayerDiscProperties(currentPlayer.id, resetPickedUpPlayer());
            return false;
          }
          var val = getPiece(ix, iy), pid = pieceData[iy]?.[ix]?.id;
          if (val?.color==turn && pid){
            resetPlayer(currentPlayer);
            pickedUp = {
              oldX: ix,
              oldY: iy,
              player: that.room.players.find((x)=>x.id==pid)
            };
            that.room.fakeSendPlayerInput(16, pid);
          }
          //else 
            //console.log(ix, iy, val, pid);
          return false;
        }
        return true;
    }
    return false;
  };
}