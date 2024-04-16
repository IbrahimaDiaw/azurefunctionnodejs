module.exports = async function(request, context) {
    const test = Object.keys(request.body);
    if (request.body && Object.keys(request.body).length > 0) {
        try {                            
            // Dynamically add parameters from the request body  
            Object.entries(request.body).forEach(([key, value]) => {  
                let type;  
                switch (typeof value) {  
                    case 'string':  
                        const date = Date.parse(value);  
                        if (!isNaN(date)) {  
                            type = sql.DateTime;  
                        } else {  
                            type = sql.NVarChar;  
                        }  
                        break;  
                    case 'number':  
                        type = Number.isInteger(value) ? sql.Int : sql.Float;  
                        break;  
                    case 'boolean':  
                        type = sql.Bit;  
                        break;  
                    case 'object':  
                        if (value instanceof Date) {  
                            type = sql.DateTime;  
                        } else {   
                            type = sql.NVarChar;  
                        }  
                        break;  
                    default:  
                        type = sql.NVarChar;  
                }  
                
                dbRequest.input(key, type, value);  
            });  
            
            
            // Formulate your SQL query. Ensure you have the correct column names and the table name  
            const result = await dbRequest.query(`  
                INSERT INTO generalSmartHealthAssessment (  
                    Name, Date_of_birth, Gender, Gender_indentification, Address, Postal_code, Phone, Race, Height, Weight, Waist, orientation, age,  
                    partners_orientation, permanent_housing, is_permanent_housing, no_permanent_housing, is_smoking, ever_smoked, quit_smoking,  
                    is_drinking_alcohol, ever_drank_alcohol, quit_alcohol, is_use_controlled_substances, ever_used_controlled_substances,  
                    quit_controlled_substances, is_physically_active, is_physical_activity, physical_activities, is_time_physical_activity,  
                    is_sharing_medication, is_typing_name_medications, is_add_images, ready_photo, name_medications, taking_medication_duration,  
                    question_about_medications, anwser_about_medications, still_having_menstrual_cycle, having_regular_periods,  
                    sharing_contraception_medication, type_method_contraception, name_medications_contraceptives, is_menopausal, chronic_disease,  
                    year_of_diagnostic, is_sharing_chronic_medication, medication_informations, is_left_lumps_incidence, skin_breast,  
                    lump_incidence_location, feel_skin_breast, index_finger, dimpling_least_breast, left_patient_report, is_right_lumps_incidence,  
                    right_lump_incidence_location, right_skin_breast, right_feel_skin_breast, right_index_finger, dimpling_right_breast,  
                    right_patient_report, is_monthly_reminder, bowel_movements, constipation, bowel_shape, bowel_color, is_blood_incidence,  
                    abdominal_pain, colon_patient_report, times_urinate, drink, water, color_urine, urine_appearance, urine_blood_incidence,  
                    urination_pain_incidence, kidney_patient_report, testExamResult, WaistResult, bmiResult, wthResult, generalHealthResult  
                ) VALUES (  
                    @Name, @Date_of_birth, @Gender, @Gender_indentification, @Address, @Postal_code, @Phone, @Race, @Height, @Weight, @Waist, @orientation, @age,  
                    @partners_orientation, @permanent_housing, @is_permanent_housing, @no_permanent_housing, @is_smoking, @ever_smoked, @quit_smoking,  
                    @is_drinking_alcohol, @ever_drank_alcohol, @quit_alcohol, @is_use_controlled_substances, @ever_used_controlled_substances,  
                    @quit_controlled_substances, @is_physically_active, @is_physical_activity, @physical_activities, @is_time_physical_activity,  
                    @is_sharing_medication, @is_typing_name_medications, @is_add_images, @ready_photo, @name_medications, @taking_medication_duration,  
                    @question_about_medications, @anwser_about_medications, @still_having_menstrual_cycle, @having_regular_periods,  
                    @sharing_contraception_medication, @type_method_contraception, @name_medications_contraceptives, @is_menopausal, @chronic_disease,  
                    @year_of_diagnostic, @is_sharing_chronic_medication, @medication_informations, @is_left_lumps_incidence, @skin_breast,  
                    @lump_incidence_location, @feel_skin_breast, @index_finger, @dimpling_least_breast, @left_patient_report, @is_right_lumps_incidence,  
                    @right_lump_incidence_location, @right_skin_breast, @right_feel_skin_breast, @right_index_finger, @dimpling_right_breast,  
                    @right_patient_report, @is_monthly_reminder, @bowel_movements, @constipation, @bowel_shape, @bowel_color, @is_blood_incidence,  
                    @abdominal_pain, @colon_patient_report, @times_urinate, @drink, @water, @color_urine, @urine_appearance, @urine_blood_incidence,  
                    @urination_pain_incidence, @kidney_patient_report, @testExamResult, @WaistResult, @bmiResult, @wthResult, @generalHealthResult  
                )  
            `);  
            return { body: result };  
        } catch (err) {  
            return { body: err};
        }
    }
}