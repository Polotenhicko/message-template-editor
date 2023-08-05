import { LOCAL_STORAGE_TEMPLATE_KEY } from '../constants/localStorage';
import { isNumber, isObject, isString } from '../utils/validators';
import localStorageService from './localStorage.service';

export interface IConditionalBlock {
  id: number;
  if: string;
  then: string | [string, string];
  else: string;
}

export interface ITemplate {
  startMessage: string;
  conditionalBlocks: IConditionalBlock[];
  finalMessage: string;
}

class TemplateService {
  public template: ITemplate | null = null;

  public getTemplate(): ITemplate {
    if (this.template) return this.template;

    const template = localStorageService.getItem(LOCAL_STORAGE_TEMPLATE_KEY);

    const isCorrectModel = this.checkCorrectModel(template);

    if (!isCorrectModel) {
      console.error('Incorrect template model!', template);
      this.saveTemplate(this.emptyTemplate);
      this.template = this.emptyTemplate;
      return this.emptyTemplate;
    }

    this.template = template;

    this.maxConditionalId = this.getMaxId(template.conditionalBlocks);

    return template;
  }

  public saveTemplate(template: ITemplate): boolean {
    const isSuccessSave = localStorageService.setItem(LOCAL_STORAGE_TEMPLATE_KEY, template);
    if (!isSuccessSave) return false;
    return true;
  }

  public addEmptyConditionalBlock(conditionalBlocks: IConditionalBlock[]): IConditionalBlock[] {
    const emptyConditionalBlock = this.emptyConditionalBlock;

    if (conditionalBlocks.length) {
      const lastConditionalBlock = conditionalBlocks[conditionalBlocks.length - 1];
      const thenString = lastConditionalBlock.then as string;
      lastConditionalBlock.then = [thenString, ''];
    }

    conditionalBlocks.push(emptyConditionalBlock);
    return conditionalBlocks;
  }

  private checkCorrectModel(template: any): boolean {
    const isConditionalBlock = (obj: any): boolean => {
      if (!isObject(obj)) return false;

      if (!isString(obj.if)) return false;
      if (!isString(obj.else)) return false;

      if (!isNumber(obj.id)) return false;

      if (Array.isArray(obj.then)) {
        const thenArr = obj.then;

        if (thenArr.length !== 2) return false;
        const hasNotString = thenArr.some((v: any) => !isString(v));
        if (hasNotString) return false;
      } else {
        if (!isString(obj.then)) return false;
      }

      return true;
    };

    // template is object
    if (!isObject(template)) return false;

    // startMessage & finalMessage is string
    const { startMessage, finalMessage } = template;
    if (!isString(startMessage) || !isString(finalMessage)) return false;

    const { conditionalBlocks } = template;
    if (!Array.isArray(conditionalBlocks)) return false;

    for (const block of conditionalBlocks) {
      if (!isConditionalBlock(block)) return false;
    }

    return true;
  }

  private maxConditionalId = 1;

  private get emptyTemplate(): ITemplate {
    return { startMessage: '', finalMessage: '', conditionalBlocks: [] };
  }

  private get emptyConditionalBlock(): IConditionalBlock {
    return { id: this.maxConditionalId++, if: '', then: '', else: '' };
  }

  private getMaxId(conditionalBlocks: IConditionalBlock[]): number {
    const max = Math.max(...conditionalBlocks.map((block) => block.id));
    return isNumber(max) ? max : 1;
  }
}

export default new TemplateService();