import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import React from 'react'
import { useContext } from 'react'
import { UserInputContext } from '@/app/_context/UserInputContext'


function TopicDescription() {
    const context = useContext(UserInputContext);
    if (!context) throw new Error('UserInputContext is not available');
    const { userCourseInput, setUserCourseInput } = context;
    const handleInputChange = (fieldName: string, value: string) => {
        setUserCourseInput((prev: typeof userCourseInput) => ({ ...prev, [fieldName]: value }));
    }

    return (
        <div className='mx-20 lg:mx-44 text-gray-900 dark:text-white'>
            {/* topic */}
            <div className='mt-5 font-bold py-3 my-2'>
                <label className="text-gray-800 dark:text-gray-200">
                    Write the topic for the course you want to create.(e.g. Introduction to ML , Basics of Python)
                </label>
                <Input
                    defaultValue={userCourseInput.topic}
                    placeholder={'topic'}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 mt-2 focus:ring-2 focus:ring-pink-400"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('topic', e.target.value)}
                />
            <div className='mt-5 font-bold py-3 mx-0 my-2'>
                <label className="text-gray-800 dark:text-gray-200">
                    Tell us more about the course you want to create. (Optional)
                </label>
                <Textarea
                    defaultValue={userCourseInput.description}
                    placeholder={'description'}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 mt-2 focus:ring-2 focus:ring-pink-400"
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                />
            </div>
            </div>
        </div>
    )
}

export default TopicDescription;