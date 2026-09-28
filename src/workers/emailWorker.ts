import { Worker } from "bullmq";
import { sendStudentWelcomeEmail, sendWelcomeEmail } from "../helper/sendWelcomeEmail";

const redisUrl = new URL(
  process.env.REDIS_URL || "redis://127.0.0.1:6379"
);

const connection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port) || 6379,
  username: redisUrl.username || undefined,
  password: redisUrl.password
    ? decodeURIComponent(redisUrl.password)
    : undefined,
};

// sendWelcomeEmailStudent

export const emailWorker = new Worker(
  "emailQueue",

  async (job) => {
    console.log("Processing email job:", job.id);

    const {
      targetEmail,
      tempPassword,studentId=null
    } = job.data;
if(studentId){ 
  console.log("mailsssssssssssssss")
sendStudentWelcomeEmail(targetEmail,
      tempPassword,studentId)
}else{
await sendWelcomeEmail(
      targetEmail,
      tempPassword
    );
}
    

    console.log("Email sent:", targetEmail);
  },

  {
    connection,
    concurrency: 5,
  }
);

emailWorker.on("completed", (job) => {
  console.log(`Email job completed: ${job.id}`);
});

emailWorker.on("failed", (job, error) => {
  console.error(
    `Email job failed: ${job?.id}`,
    error.message
  );
});



