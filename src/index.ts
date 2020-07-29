import VueAudios from './vue-audios.vue';

export { VueAudios };

import Vue, { VueConstructor } from 'vue';

const plugin = (_Vue: VueConstructor<Vue>) => {
	_Vue.component('VueAudios', VueAudios);
};

export default plugin;

if (typeof window !== 'undefined' && !!window.Vue) {
	(window as any).Vue.use(plugin);
}
