'use strict';
const execa = require('execa');
const {from} = require('rxjs');
const {catchError} = require('rxjs/operators');
const handleNpmError = require('./handle-npm-error');

const pkgPublish = (pkgManager, options) => {
	const args = ['publish'];

	if (options.contents) {
		args.push(options.contents);
	}

	if (options.tag) {
		args.push('--tag', options.tag);
	}

	if (options.otp) {
		args.push('--otp', options.otp);
	}

	if (options.publishScoped) {
		args.push('--access', 'public');
	}

	if (options.preview) {
		return args;
	}

	return execa(pkgManager, args);
};

module.exports = (context, pkgManager, task, options) =>
	from(pkgPublish(pkgManager, options)).pipe(
		catchError(error => handleNpmError(error, task, otp => {
			context.otp = otp;

			return pkgPublish(pkgManager, {...options, otp});
		}))
	);

module.exports.pkgPublish = pkgPublish;
