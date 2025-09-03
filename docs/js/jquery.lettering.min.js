/*
 * Lettering.js 0.7.0 - https://github.com/davatron5000/Lettering.js
 * Para usar localmente no projeto Jarvis
 */
!function(a){function b(b,c,d,e){var f=b.text(),g=f.replace(c,d);return g!==f&&e&&(g=e(g,b)),b.html(g)}function c(c){var d=c||{};return c=a.extend({find:" ",tag:"<span>",before:"",after:"",className:"char"},d),this.each(function(){var d=a(this);d.data("lettering")||(d.data("lettering",!0),b(d,c.find,'<'+c.tag+' class="'+c.className+'$1">'+c.before+"$2"+c.after+"</"+c.tag+">",function(b,c){return b.replace(/(\s*)(\S)/g,"$1"+c.before+"$2"+c.after)}))})}var d={init:c,set:a.fn.lettering};a.fn.lettering=function(b){return b&&d[b]?d[b].apply(this,[].slice.call(arguments,1)):"object"!=typeof b&&b?void a.error("Method "+b+" does not exist on jQuery.lettering"):c.apply(this,arguments)}}(jQuery);
