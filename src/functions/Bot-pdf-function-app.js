const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');
const getConnection = require('./dabataseConfig');
const PDFDocument = require('pdfkit');
const fs = require('fs');  
const path = require('path');

app.http('Bot-pdf-function-app', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => { 
        try {
            // database connection
            const {name, age, testExamResult, WaistResult, bmiResult, wthResult, generalHealthResult} = await request.json(); 
            const blobServiceClient = new BlobServiceClient(process.env.AZURE_STORAGE_CONNECTION_STRING);  
            const containerClient = blobServiceClient.getContainerClient(process.env.BLOB_CONTAINER_NAME);
            const suffix = `planheal-general-health-for-${name?.replace(/\s+/g, '').toLowerCase()}`;  
            const dateTime = new Date().toISOString().replace(/[^0-9]/g, "");  
            const blobName = `${suffix}-${dateTime}.pdf`;
    
            const doc = new PDFDocument();  
            let buffers = [];  
            doc.on('data', buffers.push.bind(buffers));  
            doc.on('end', () => {  
                const pdfData = Buffer.concat(buffers);  
                context.res = {  
                    status: 200, // HTTP Status Code  
                    headers: {  
                        'Content-Type': 'application/pdf',  
                        'Content-Disposition': 'attachment; filename=PLANHEAL_GENERAL_HEALTH_ASSESSMENT.pdf',  
                    },  
                    body: pdfData,  
                    isRaw: true,  
                };  
            });  
    
            // Génération du contenu du PDF  
            doc.fontSize(12).text('PLANHEAL GENERAL HEALTH ASSESSMENT', { underline: true, paragraphGap: 5 });  
            doc.fontSize(12).text(`NAME: ${name}`, { underline: true, paragraphGap: 5 });
            doc.fontSize(12).text(`Age: ${age}`, { underline: true, paragraphGap: 5 });
            doc.text(`${testExamResult?.replace(/\*\*(.*?)\*\*/g, '$1')}`);  
            doc.text(`${WaistResult?.replace(/\*\*(.*?)\*\*/g, '$1')}`);  
            doc.text(`${bmiResult?.replace(/\*\*(.*?)\*\*/g, '$1')}`);
            doc.text(`${wthResult?.replace(/\*\*(.*?)\*\*/g, '$1')}`);
            doc.text(`${generalHealthResult?.replace(/\*\*(.*?)\*\*/g, '$1')}`);
            doc.end();
  
            // Attendre que le stream soit prêt  
            const buffer = await streamToBuffer(doc);  
        
            // Créer un blob à partir du stream PDF  
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);  
            await blockBlobClient.upload(buffer, buffer.length, {  
                blobHTTPHeaders: { 
                    blobContentType: "application/pdf"
                }  
            });
            const urlWithSAS = blockBlobClient.url; 
            const parsedUrl = new URL(urlWithSAS);  
            const urlWithoutQuery = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;
            context.res = {  
                body: urlWithoutQuery,
                headers: {  
                    'Content-Type': 'application/json',
                }  
            };     
            return { body: context.res.body };
        } catch (error) {  
                return { body : error}; 
            }  
        }
        
    });

// app.http('generatePdf', {
//     methods: ['GET'],
//     authLevel: 'anonymous',
//     handler: async (request, context) => {
//         try {
//             const connection = await getConnection();
//             const dbRequest = connection.request();
//             const result = await dbRequest.query('SELECT TOP 1 * FROM generalSmartHealthAssessment ORDER BY ColumnDateTime DESC');
//             let doc = new PDFDocument();  
        
//             let tempFilePath = path.join(__dirname, 'PLANHEAL_GENERAL_HEALTH_ASSESSMENT.pdf');  
//             doc.pipe(fs.createWriteStream(tempFilePath));  
        
//             doc.fontSize(12).text('PLANHEAL GENERAL HEALTH ASSESSMENT', { underline: true, paragraphGap: 5 });  
//             doc.fontSize(12).text(`NAME: ${result.recordset[0].Name}`, { underline: true, paragraphGap: 5 });
//             result.recordset.forEach(record => { 
//             doc.text(`${record.testExamResult?.replace(/\*\*(.*?)\*\*/g, '$1')}`);  
//             doc.text(`${record.WaistResult?.replace(/\*\*(.*?)\*\*/g, '$1')}`);  
//             doc.text(`${record.bmiResult?.replace(/\*\*(.*?)\*\*/g, '$1')}`);
//             doc.text(`${record.wthResult?.replace(/\*\*(.*?)\*\*/g, '$1')}`);
//             doc.text(`${record.generalHealthResult?.replace(/\*\*(.*?)\*\*/g, '$1')}`);
//             });  
          
//             doc.end();  
        
//             await new Promise(resolve => setTimeout(resolve, 1000));  
//             let content = fs.readFileSync(tempFilePath);  
//             context.res = {  
//                 body: content,  
//                 headers: {  
//                     'Content-Type': 'application/pdf',  
//                     'Content-Disposition': 'attachment; filename="PLANHEAL_GENERAL_HEALTH_ASSESSMENT.pdf"'  
//                 }  
//             };    
//             //fs.unlinkSync(tempFilePath);

//             return {body: context.res.body}

//         } catch (error) {
//             return { body : error};
//         }
//     }
// });

async function streamToBuffer(stream) {  
    const chunks = [];  
    for await (const chunk of stream) {  
        chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));  
    }  
    return Buffer.concat(chunks);  
}  
