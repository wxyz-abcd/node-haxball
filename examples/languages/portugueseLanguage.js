// Special thanks to Juze(https://github.com/guguxh) for this contribution.

export default function PortugueseLanguage(API){
  const { ErrorCodes, ConnectionState, RendererTextIndices } = API.Language.indices;
  const { K } = API.Impl.Utils;

  const ErrorsTextMap = {
    [ErrorCodes.Empty]: () => "",
    [ErrorCodes.ConnectionClosed]: (reason) => "Conexão encerrada" + ((reason != null) ? " (" + reason + ")" : ""),
    [ErrorCodes.GameStateTimeout]: () => "Game state timeout",
    [ErrorCodes.RoomClosed]: () => "A sala foi fechado.",
    [ErrorCodes.RoomFull]: () => "A sala está cheia.",
    [ErrorCodes.WrongPassword]: () => "Senha errada.",
    [ErrorCodes.BannedBefore]: () => "Você foi banido dessa sala.",
    [ErrorCodes.IncompatibleVersion]: () => "Versão incompatível.",
    [ErrorCodes.FailedHost]: () => "Falha em conectar a sala. Se o problema persistir, consulte a wikia: https://github.com/haxball/haxball-issues/wiki/Connection-Issues",
    [ErrorCodes.Unknown]: () => "Um erro ocorreu enquanto tentava se conectar.<br><br>Isso pode ser causado por uma extensão, tente desativar todas elas e reiniciar o site.<br><br>O erro foi escrito no console (F12).",
    [ErrorCodes.Cancelled]: () => "Cancelado",
    [ErrorCodes.FailedPeer]: () => "Falha em conectar ao host.",
    [ErrorCodes.KickedNow]: (reason, ban, byName) => "Você foi " + (ban ? "banido" : "kickado") + (byName?.length > 0 ? (" por " + byName) : "") + (reason?.length > 0 ? (" (" + reason + ")") : ""),
    [ErrorCodes.Failed] : () => "Falhou",
    [ErrorCodes.MasterConnectionError] : () => "Erro de conexão",
    [ErrorCodes.StadiumParseError]: (section, index) => "Erro no \"" + section + "\" ponto: " + index,
    [ErrorCodes.StadiumParseSyntaxError]: (lineNumber) => "Erro de sintaxe na linha: " + lineNumber,
    [ErrorCodes.StadiumParseUnknownError]: () => "Erro ao carregar o arquivo de estádio.",
    [ErrorCodes.ObjectCastError]: (object, type) => "Impossível chamar " + K.ye(object) + " para " + K.ye(type),
    [ErrorCodes.TeamColorsReadError]: () => "too many",
    [ErrorCodes.UTF8CharacterDecodeError]: (offset, charCode) => "Não consegue decodificar o caractere UTF8 no Offset " + offset + ": charCode (" + charCode + ") é inválido",
    [ErrorCodes.ReadTooMuchError]: () => "Erro de leitura",
    [ErrorCodes.ReadWrongStringLengthError]: (expectedLength) => "O comprimento da string difere da especificada: " + expectedLength + " bytes",
    [ErrorCodes.EncodeUTF8CharNegativeError]: (num) => "Não foi possível codificar o caractere UTF8: charCode (" + num + ") é negativo",
    [ErrorCodes.EncodeUTF8CharTooLargeError]: (num) => "Não foi possível codificar o caractere UTF8: charCode (" + num + ") é muito grande (>= 0x80000000)",
    [ErrorCodes.CalculateLengthOfUTF8CharNegativeError]: (num) => "Não consegue calcular o comprimento do caractere UTF8: charCode (" + num + ") é negativo",
    [ErrorCodes.CalculateLengthOfUTF8CharTooLargeError]: (num) => "Não consegue calcular o comprimento do caractere UTF8: charCode (" + num + ") é muito grande (>= 0x80000000)",
    [ErrorCodes.BufferResizeParameterTooSmallError]: () => "Não foi possível redimensionar o buffer para uma capacidade menor que 1",
    [ErrorCodes.BadColorError]: () => "Apenas cor HEX",
    [ErrorCodes.BadTeamError]: () => "Apenas 1 ou 2",
    [ErrorCodes.StadiumLimitsExceededError]: () => "Erro",
    [ErrorCodes.MissingActionConfigError]: () => "A classe não possuí configuração",
    [ErrorCodes.UnregisteredActionError]: () => "Tentou aplicar uma ação não registrada",
    [ErrorCodes.MissingImplementationError]: () => "Falta implementação",
    [ErrorCodes.AnnouncementActionMessageTooLongError]: () => "mensagem muito grande",
    [ErrorCodes.ChatActionMessageTooLongError]: () => "mensagem muito grande",
    [ErrorCodes.KickBanReasonTooLongError]: () => "string muito grande",
    [ErrorCodes.ChangeTeamColorsInvalidTeamIdError]: () => "ID de time inválido",
    [ErrorCodes.MissingRecaptchaCallbackError]: () => "Recaptcha requisitado. Deve alterar no onRequestRecaptcha ou inserir um token válido.",
    [ErrorCodes.ReplayFileVersionMismatchError]: () => "O replay é de uma versão diferente",
    [ErrorCodes.ReplayFileReadError]: () => "Não consegue carregar o replay.",
    [ErrorCodes.JoinRoomNullIdAuthError]: () => "ID e Auth não podem ser nulos. (dentro do primeiro parâmetro)",
    [ErrorCodes.PlayerNameTooLongError]: (conn, auth, name) => "Nome muito grande",
    [ErrorCodes.PlayerCountryTooLongError]: (conn, auth, name, flag) => "Bandeira incorreta",
    [ErrorCodes.PlayerAvatarTooLongError]: (conn, auth, name, flag, avatar) => "Avatar muito longo",
    [ErrorCodes.PlayerJoinBlockedByMPDError]: (conn, auth, name, flag, avatar) => "A entrada do jogador está proibida: " + name + " " + flag + " " + avatar + " " + conn + " " + auth,
    [ErrorCodes.PlayerJoinBlockedByORError]: (playerObj) => "O jogador não pode entrar por conta do evento operationReceived: " + playerObj,
    [ErrorCodes.PluginNotFoundError]: (pluginIndex) => "O Plugin não foi encontrado no index " + pluginIndex,
    [ErrorCodes.PluginNameChangeNotAllowedError]: () => "O nome do Plugin não deve mudar",
    [ErrorCodes.LibraryNotFoundError]: (libraryIndex) => "A Lib não foi encontrada no index " + libraryIndex,
    [ErrorCodes.LibraryNameChangeNotAllowedError]: () => "O nome da Lib não deve mudar",
    [ErrorCodes.AuthFromKeyInvalidIdFormatError]: () => "Formato de ID inválido",
    [ErrorCodes.LanguageAlreadyExistsError]: (abbr) => "Essa linguagem já existe: " + abbr,
    [ErrorCodes.CurrentLanguageRemovalError]: () => "A linguagem atual não pode ser removida. Mude para outra linguagem, primeiro.",
    [ErrorCodes.LanguageDoesNotExistError]: (abbr) => "Essa linguagem não existe: " + abbr,
    [ErrorCodes.BadActorError]: () => "Bad Actor",
    [ErrorCodes.AuthBannedError]: (auth)=>"Auth banido: "+auth,
  };

  const ConnectionStateTextMap = {
    [ConnectionState.ConnectingToMaster]: "Connecting to master",
    [ConnectionState.ConnectingToPeer]: "Connecting to peer",
    [ConnectionState.AwaitingState]: "Awaiting state",
    [ConnectionState.Active]: "Active",
    [ConnectionState.ConnectionFailed]: "Connection Failed",
  };

  const RendererTextMap = {
    [RendererTextIndices.timeIsUp1]: "Time is",
    [RendererTextIndices.timeIsUp2]: "Up!",
    [RendererTextIndices.redIsVictorious1]: "Red is",
    [RendererTextIndices.redIsVictorious2]: "Victorious!",
    [RendererTextIndices.redScores1]: "Red",
    [RendererTextIndices.redScores2]: "Scores!",
    [RendererTextIndices.blueIsVictorious1]: "Blue is",
    [RendererTextIndices.blueIsVictorious2]: "Victorious!",
    [RendererTextIndices.blueScores1]: "Blue",
    [RendererTextIndices.blueScores2]: "Scores!",
    [RendererTextIndices.gamePaused1]: "Game",
    [RendererTextIndices.gamePaused2]: "Paused"
  };

  return [ErrorsTextMap, ConnectionStateTextMap, RendererTextMap];
};
