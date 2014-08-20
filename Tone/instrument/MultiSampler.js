define(["Tone/core/Tone", "Tone/instrument/Sampler"], 
function(Tone){

	/**
	 *  @class Aggregates multiple Tone.MultiSamplers into a single instrument.
	 *         Pass in a mapping of names to sample urls and an optional 
	 *         callback to invoke when all of the samples are loaded. 
	 *
	 *  @example
	 *  var sampler = new Tone.MultiSampler({
	 *  	"kick" : "../audio/BD.mp3",
	 *  	"snare" : "../audio/SD.mp3",
	 *  	"hat" : "../audio/hh.mp3"
	 *  }, onload);
	 *  //once loaded...
	 *  sampler.triggerAttack("kick");
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {Object} samples the samples used in this
	 *  @param {function} onload the callback to invoke when all 
	 *                           of the samples have been loaded
	 */
	Tone.MultiSampler = function(samples, onload){

	 	/**
	 	 *  @type {GainNode}
	 	 */
		this.output = this.context.createGain();

	 	/**
	 	 *  the array of voices
	 	 *  @type {Tone.Sampler}
	 	 */
		this.samples = {};

		//make the samples
		this._createSamples(samples, onload);
	};

	Tone.extend(Tone.MultiSampler);

	/**
	 *  creates all of the samples and tracks their loading
	 *  
	 *  @param   {Object} samples the samples
	 *  @param   {function} onload  the onload callback
	 *  @private
	 */
	Tone.MultiSampler.prototype._createSamples = function(samples, onload){
		//object which tracks the number of loaded samples
		var loadCounter = {
			total : 0,
			loaded : 0
		};
		//get the count
		for (var s in samples){
			if (typeof samples[s] === "string"){
				loadCounter.total++;
			}
		}
		//the function to invoke when a sample is loaded
		var onSampleLoad = function(){
			loadCounter.loaded++;
			if (loadCounter.loaded === loadCounter.total){
				if (onload){
					onload();
				}
			}
		};
		for (var samp in samples){
			var url = samples[samp];
			var sampler = new Tone.Sample(url, onSampleLoad);
			sampler.connect(this.output);
			this.samples[samp] = sampler;
		}
	};

	 /**
	  *  start a sample
	  *  
	  *  @param  {string} sample the note name to start
	  *  @param {Tone.Time=} [time=now] the time when the note should start
	  */
	Tone.MultiSampler.prototype.triggerAttack = function(sample, time){
		if (this.samples.hasOwnProperty(sample)){
			this.samples[sample].triggerAttack(time);
		}
	};

	 /**
	  *  start the release portion of the note
	  *  
	  *  @param  {string} sample the note name to release
	  *  @param {Tone.Time=} [time=now] the time when the note should release
	  */
	Tone.MultiSampler.prototype.triggerRelease = function(sample, time){
		if (this.samples.hasOwnProperty(sample)){
			this.samples[sample].triggerRelease(time);
		}
	};

	/**
	 *  clean up
	 */
	Tone.MultiSampler.dispose = function(){
		for (var samp in this.samples){
			this.samples[samp].dispose();
			this.samples[samp] = null;
		}
		this.output.disconnect();
		this.output = null;
	};

	return Tone.MultiSampler;
});