import {
  CacheType,
  CommandInteraction,
  MessageContextMenuCommandInteraction,
} from "discord.js";
import {
  CustomInteractionReplyOptions,
  InteractionCommand,
} from "../../classes/CustomInteraction";

import { ApplicationCommandType } from "discord-api-types/v10";
import { CustomClient } from "lib/client";

import axios from "axios";

interface detectedLanguage {
  confidence: number;
  language: string;
}

interface translatedData {
  alternatives: Array<string>;
  detectedLanguage: detectedLanguage;
  translatedText: string;
}

//translation provider must be LibreTranslate format
async function translate(message: string): Promise<string>{
    const req = axios.post("https://lt.blitzw.in/translate", {
        q: message,
        source: 'auto',
        target: 'en',
        format: 'text',
        alternatives: 3
    });

    const dataPromise = req.then((response) => response.data)
    return JSON.stringify(await dataPromise)
}

export default class ContextCommand extends InteractionCommand {
  /**
   *
   */
  constructor(client: CustomClient) {
    super(client, {
      type: ApplicationCommandType.Message,
      name: "Translate",
      defaultMemberPermissions: "Administrator",
    });
  }

  async execute(
    interaction: CommandInteraction<CacheType>
  ): Promise<CustomInteractionReplyOptions> {
    const int = interaction as MessageContextMenuCommandInteraction;
    const msg = int.targetMessage.content.trim()

    const translated: translatedData = JSON.parse(await translate(msg));

    const translatedText = translated.translatedText;
    const languageCode = translated.detectedLanguage.language;
    const languageNames = new Intl.DisplayNames(['en'], { type: 'language'});
    const language = languageNames.of(languageCode)

    const confidence = translated.detectedLanguage.confidence;
    const alternatives = translated.alternatives;

  return { content: `${`**Text:** "${translatedText}" \n**Language:** ${language} \n**Confidence:** ${confidence}% \n**Alternatives:** ${alternatives}`}`, eph: true };
  }
}
