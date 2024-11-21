'use client'

import qs from 'query-string'
import { SearchIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Search = () => {

    const router = useRouter()
    const [ value, setValue ] = useState('')
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!value) return

        const url = qs.stringifyUrl({
            url: '/search',
            query: { term: value }
        }, {skipEmptyString: true}) //?term= is not added to the url if value is empty

        router.push(url) //localhost:3000/?term=value
    }

    const onClear = () => {
        setValue('')
    }

    return (
        <form
            onSubmit={onSubmit}
            className='relative w-full lg:w-[400px] flex items-center space-x-0.1'
        >
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder='Search'
                className='rounded-r-none focus-visible:ring-0 focus-visible:border-red-600 focus-visible:border-[1.5px] '
            />
            {value && (
                <X
                    className='absolute top-2.5 right-14 h-5 w-5 cursor-pointer text-muted-foreground hover:opacity-75 transition'
                    onClick={onClear}
                />
            )}
            <Button
                type='submit'
                size='default'
                variant='secondary'
                className='rounded-l-none'
            >
                <SearchIcon className='h-5 w-5 text-muted-foreground' />
            </Button>
        </form>
    )
}