<template>
	<div class="audio-contain">
		<audio
			ref="audio"
			class="audio"
			id="audio"
			:src="url"
			preload="auto"
			:autoplay="autoplay"
		></audio>
		<div class="operate-btn" @click.stop="onOperate">
			<img v-if="!isPlaying" src="./images/play.png" />
			<img v-else src="./images/pause.png" />
		</div>
		<div class="time">{{ formatCurrentTime }}</div>
		<div class="progress-bar" ref="progress" @click.stop="onSeek">
			<div
				class="progress-current"
				:style="{
					width: slideProgress ? currentSlide : currentProgress
				}"
			></div>
			<div
				class="point-contain"
				:style="{
					left: slideProgress ? currentSlide : currentProgress
				}"
				@touchstart.stop="onTouchStart"
				@touchmove.stop="onTouchMove"
				@touchend.stop="onTouchEnd"
			>
				<div class="progress-point"></div>
			</div>
		</div>
		<div class="duration">
			{{ formatDuration }}
		</div>
	</div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { secondToDate } from './utils';
import voiceManage from './voice-manage';

@Component<SourceVoice>({})
export default class SourceVoice extends Vue {
	@Prop({ default: 0 }) duration!: number;
	@Prop({ default: '', required: true }) url!: string;
	@Prop({ default: false }) autoplay!: boolean;

	public timer: any = 0;
	public timer1: any = 0;
	public currentTime: number = 0;
	public startX: number = 0;
	public slideProgress: number = 0;
	public containWidth: number = 0;

	public get formatCurrentTime() {
		return secondToDate(this.currentTime);
	}
	public get formatDuration() {
		return secondToDate(this.duration);
	}
	public get isPlaying() {
		const arr = voiceManage.getItem(this.url);
		if (!arr.length) return false;
		return arr[0].isPlaying;
	}
	public get currentProgress() {
		return (this.currentTime / this.duration) * 100 + '%';
	}
	public get currentSlide() {
		return this.slideProgress * 100 + '%';
	}

	@Watch('isPlaying')
	onIsPlayingChange(val: boolean) {
		if (val) {
			this.timer = setInterval(() => {
				this.currentTime = (this as any).$refs.audio.currentTime;
				if (this.currentTime === (this as any).$refs.audio.duration) {
					clearInterval(this.timer);
					this.currentTime = 0;
					voiceManage.setItem(this.url);
				}
			}, 600);
		} else {
			clearInterval(this.timer);
		}
	}

	public async mounted() {
		await this.$nextTick();
		if (this.autoplay) {
			(this as any).$refs.audio.play();
		}
		voiceManage.subscribe({
			key: this.url,
			el: this.$refs.audio
		});
		const bcr = (this as any).$refs.progress.getBoundingClientRect();
		this.containWidth = bcr.width;
	}

	public onOperate() {
		voiceManage.toggle(this.url);
	}
	public onTouchStart(e: any) {
		if (!e.touches.length) return;
		this.startX = e.touches[0].pageX;
	}
	public onTouchMove(e: any) {
		if (!e.touches.length) return;
		const d = e.touches[0].pageX - this.startX;
		const p = d / this.containWidth;
		this.slideProgress = this.currentTime / this.duration + p;
	}
	public async onTouchEnd() {
		await this.$nextTick();
		const t = this.slideProgress * this.duration;
		!this.isPlaying && voiceManage.toggle(this.url);
		(this as any).$refs.audio.currentTime = t;
		this.timer1 = setTimeout(() => {
			this.slideProgress = 0;
		}, 600);
	}
	public async onSeek(e: any) {
		await this.$nextTick();
		const t = (e.offsetX / this.containWidth) * this.duration;
		!this.isPlaying && voiceManage.toggle(this.url);
		(this as any).$refs.audio.currentTime = t;
	}

	public beforeDestroy() {
		voiceManage.cancel(this.url);
		clearInterval(this.timer);
		clearTimeout(this.timer1);
	}
}
</script>

<style lang="less">
.audio-contain {
	width: 278px;
	height: 40px;
	background: #fff;
	background-color: #f7f7f7;
	border-radius: 10px;
	overflow: hidden;
	display: flex;
	align-items: center;
	font-size: 12px;
	font-family: PingFang SC;
	font-weight: 400;
	color: rgba(144, 147, 153, 1);
	margin-top: 10px;

	.audio {
		display: none;
	}

	.operate-btn {
		width: 28px;
		height: 28px;
		background: #12dba5;
		border-radius: 100px;
		margin: 0 8px 0 10px;
		display: flex;
		justify-content: center;
		align-items: center;
		img {
			height: 15px;
			width: 16px;
		}
	}

	.progress-bar {
		height: 2px;
		position: relative;
		background: rgba(0, 194, 149, 0.2);
		flex: 1;
		margin: 10px;
		border-radius: 10px;

		.progress-current {
			position: absolute;
			top: 0;
			left: 0;
			bottom: 0;
			width: 0;
			border-radius: 10px 0 0 10px;
			background: #12dba5;
			z-index: 1;
		}

		.point-contain {
			// prettier-ignore
			height: 16PX;
			// prettier-ignore
			width: 16PX;
			position: absolute;
			top: 50%;
			transform: translate(-30%, -50%);
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.progress-point {
			height: 8px;
			width: 8px;
			border-radius: 8px;
			background: #12dba5;
		}
	}
	.duration {
		margin-right: 10px;
	}
}
</style>
