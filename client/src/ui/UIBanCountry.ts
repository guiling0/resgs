const { regClass } = Laya;
import { UIBanCountryBase } from './UIBanCountry.generated';

const results: ['wei', 'shu', 'wu', 'qun', 'jin'] = [
    'wei',
    'shu',
    'wu',
    'qun',
    'jin',
];

@regClass()
export class UIBanCountry extends UIBanCountryBase {
    play(result: string) {
        const index = results.indexOf(result as any);
        if (index !== -1) {
            this.visible = true;
            const ani: any[] = [(index + 1) * 1, (index + 1) * 1 + 5];
            if (ani[0] === 1) ani[0] = '';
            this.banBg.play(`play${ani[1]}`, false);
            this.ban_result.play(`play${ani[0]}`, false);

            this.ban_result.once(Laya.Event.STOPPED, () => {
                // this[`${results[result - 1]}_result`].visible = true;
                this[`${results[index]}_result`].play('play11', false, false);
                this[`${results[index]}_result`].once(
                    Laya.Event.STOPPED,
                    () => {}
                );
                this.result.visible = true;
                this.result.loadImage(
                    `resources/room/texture/game/bancountry/ban_country_result_${
                        index + 1
                    }.png`
                );
            });
            this.timerOnce(7000, this, () => {
                this.result.visible = false;
                this.visible = false;
            });
        }
    }
}
