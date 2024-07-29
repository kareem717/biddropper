import * as AWS from "aws-sdk";
import { env } from "../env.mjs";
import { registerService } from "../utils";

AWS.config.update({
	accessKeyId: env.AWS_ACCESS_KEY,
	secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
	region: env.AWS_SES_REGION,
});

AWS.config.getCredentials(function (error) {
	if (error) {
		console.log(error.stack);
	}
});

const SES = registerService(
	"aws-ses",
	() => new AWS.SES({ apiVersion: "2010-12-01" })
);

export default SES;
